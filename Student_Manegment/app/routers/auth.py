import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.student import Student
from app.models.staff import Staff, StaffRole
from app.models.admin import Admin
from app.models.academic import ClassGroup
from app.models.password_reset import PasswordResetOtp
from app.schemas.auth import (
    StudentRegisterRequest,
    StaffRegisterRequest,
    AdminRegisterRequest,
    LoginRequest,
    TokenResponse,
    MessageResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyOtpRequest,
    ResetPasswordRequest,
)

router = APIRouter()


def get_existing_role_for_email(email: str, db: Session) -> str | None:
    """
    Checks if the email is already registered anywhere in the system (Student, Staff, or Admin)
    and returns the registered role name ('Student', 'Staff', or 'Admin'), or None if not found.
    """
    email_clean = email.strip().lower()
    if db.query(Student).filter(func.lower(Student.email) == email_clean).first():
        return "Student"
    if db.query(Staff).filter(func.lower(Staff.email) == email_clean).first():
        return "Staff"
    if db.query(Admin).filter(func.lower(Admin.email) == email_clean).first():
        return "Admin"
    return None


def check_email_exists(email: str, db: Session) -> bool:
    """Checks if the email is already registered anywhere in the system (Student, Staff, or Admin)."""
    return get_existing_role_for_email(email, db) is not None


def validate_cross_role_email(email: str, target_role: str, db: Session):
    """
    Validates that the given email is completely unique across all roles.
    If an email is already registered as a Student, it cannot register as Staff or Admin, and vice versa.
    """
    email_clean = email.strip().lower()
    existing_role = get_existing_role_for_email(email_clean, db)
    if existing_role:
        if existing_role.lower() == target_role.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This Email ID is already registered as a {existing_role} in the system.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This Email ID is already registered as a {existing_role}. A {existing_role} email cannot be registered as {target_role}.",
            )


@router.get("/check-email")
def check_email_availability(email: str, db: Session = Depends(get_db)):
    """API endpoint to check if an email already exists in the system and under which role."""
    email_clean = email.strip().lower()
    existing_role = get_existing_role_for_email(email_clean, db)
    return {
        "email": email_clean,
        "exists": existing_role is not None,
        "registered_role": existing_role,
    }


@router.post("/register/student", response_model=MessageResponse)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    from app.models.student import PreRegisteredStudent
    
    email_clean = payload.email.strip().lower()
    validate_cross_role_email(email_clean, "Student", db)

    # SECURE REGISTRATION: Check if reg_no is in PreRegisteredStudent
    pre_reg = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.reg_no == payload.reg_no.strip()).first()
    if not pre_reg:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your Register Number is not authorized for registration. Please contact your staff/admin to get added.",
        )

    class_obj = db.query(ClassGroup).filter(ClassGroup.id == payload.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Selected class (ID {payload.class_id}) does not exist.",
        )

    existing_reg = db.query(Student).filter(Student.reg_no == payload.reg_no.strip()).first()
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Register Number already registered",
        )

    student = Student(
        full_name=payload.full_name.strip(),
        reg_no=payload.reg_no.strip(),
        roll_no=payload.roll_no.strip(),
        umis_id=payload.umis_id.strip() if payload.umis_id else None,
        department=payload.department,
        branch=payload.branch,
        class_id=payload.class_id,
        dob=payload.dob,
        email=email_clean,
        password_hash=hash_password(payload.password),
    )
    db.add(student)
    
    # Optionally remove or mark pre-registration as used, but we can leave it as a log.
    
    db.commit()
    return {"message": "Student registered successfully"}


@router.post("/register/staff", response_model=MessageResponse)
def register_staff(payload: StaffRegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    validate_cross_role_email(email_clean, "Staff", db)

    role_type_normalized = payload.role_type.strip().lower()
    if role_type_normalized not in ("advisor", "subject", "both"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="role_type must be advisor, subject, or both",
        )

    staff = Staff(
        full_name=payload.full_name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
        role_type=StaffRole(role_type_normalized),
        department=payload.department,
    )
    db.add(staff)
    db.commit()
    return {"message": "Staff registered successfully"}


@router.post("/register/admin", response_model=MessageResponse)
def register_admin(payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    validate_cross_role_email(email_clean, "Admin", db)

    admin = Admin(
        full_name=payload.full_name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
        designation=payload.designation or "Principal",
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    role_type = payload.user_type.strip().lower()

    if role_type == "student":
        user = db.query(Student).filter(func.lower(Student.email) == email_clean).first()
    elif role_type == "staff":
        user = db.query(Staff).filter(func.lower(Staff.email) == email_clean).first()
    elif role_type == "admin":
        user = db.query(Admin).filter(func.lower(Admin.email) == email_clean).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_type must be student, staff, or admin",
        )

    if not user:
        # Check if the email exists under a different role and guide the user
        other_role = get_existing_role_for_email(email_clean, db)
        if other_role and other_role.lower() != role_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This email is registered as a {other_role}. Please sign in using the {other_role} login tab.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(
        data={"sub": str(user.id), "user_type": role_type}
    )
    return TokenResponse(
        access_token=token,
        user_type=role_type,
        user_id=user.id,
        full_name=user.full_name,
        profile_picture_url=user.profile_picture_url,
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates password reset by sending/generating a 6-digit OTP code valid for 15 minutes.
    """
    email_clean = payload.email.strip().lower()

    # Identify user role across all roles
    role = get_existing_role_for_email(email_clean, db)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )

    if payload.user_type and payload.user_type.strip().lower() != role.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This email belongs to a {role} account, not {payload.user_type}."
        )

    # Invalidate previous unused OTPs for this email
    db.query(PasswordResetOtp).filter(
        func.lower(PasswordResetOtp.email) == email_clean,
        PasswordResetOtp.used == False
    ).update({"used": True})

    # Generate 6-digit random code
    otp = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    reset_record = PasswordResetOtp(
        email=email_clean,
        user_type=role.lower(),
        otp_code=otp,
        expires_at=expires_at,
        used=False
    )
    db.add(reset_record)
    db.commit()

    print(f"[AUTH] Password reset OTP generated for {email_clean} ({role}): {otp}")

    return ForgotPasswordResponse(
        message=f"A 6-digit password reset code has been sent for your {role} account.",
        email=email_clean,
        user_type=role.lower(),
        otp_preview=otp
    )


@router.post("/verify-reset-otp", response_model=MessageResponse)
def verify_reset_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Validates that the OTP is correct and has not expired or been used.
    """
    email_clean = payload.email.strip().lower()
    otp_clean = payload.otp.strip()

    record = db.query(PasswordResetOtp).filter(
        func.lower(PasswordResetOtp.email) == email_clean,
        PasswordResetOtp.otp_code == otp_clean,
        PasswordResetOtp.used == False
    ).order_by(PasswordResetOtp.id.desc()).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )

    now = datetime.now(timezone.utc)
    record_expires = record.expires_at
    if record_expires.tzinfo is None:
        record_expires = record_expires.replace(tzinfo=timezone.utc)

    if record_expires < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired. Please request a new one."
        )

    return MessageResponse(message="Reset code is valid.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Resets the user's password after verifying the OTP code.
    """
    email_clean = payload.email.strip().lower()
    otp_clean = payload.otp.strip()
    new_password = payload.new_password.strip()

    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    record = db.query(PasswordResetOtp).filter(
        func.lower(PasswordResetOtp.email) == email_clean,
        PasswordResetOtp.otp_code == otp_clean,
        PasswordResetOtp.used == False
    ).order_by(PasswordResetOtp.id.desc()).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )

    now = datetime.now(timezone.utc)
    record_expires = record.expires_at
    if record_expires.tzinfo is None:
        record_expires = record_expires.replace(tzinfo=timezone.utc)

    if record_expires < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired. Please request a new one."
        )

    # Locate user in student, staff, or admin tables
    role = record.user_type.lower()
    user = None
    if role == "student":
        user = db.query(Student).filter(func.lower(Student.email) == email_clean).first()
    elif role == "staff":
        user = db.query(Staff).filter(func.lower(Staff.email) == email_clean).first()
    elif role == "admin":
        user = db.query(Admin).filter(func.lower(Admin.email) == email_clean).first()

    if not user:
        user = (
            db.query(Student).filter(func.lower(Student.email) == email_clean).first() or
            db.query(Staff).filter(func.lower(Staff.email) == email_clean).first() or
            db.query(Admin).filter(func.lower(Admin.email) == email_clean).first()
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account could not be found."
        )

    user.password_hash = hash_password(new_password)
    record.used = True
    db.commit()

    return MessageResponse(message="Password reset successfully! You can now sign in with your new password.")