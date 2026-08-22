from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.student import Student
from app.models.staff import Staff, StaffRole
from app.models.admin import Admin
from app.schemas.auth import (
    StudentRegisterRequest,
    StaffRegisterRequest,
    AdminRegisterRequest,
    LoginRequest,
    TokenResponse,
    MessageResponse,
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