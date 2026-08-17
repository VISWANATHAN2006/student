from fastapi import APIRouter, Depends, HTTPException, status
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


@router.post("/register/student", response_model=MessageResponse)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(
        (Student.email == payload.email) | (Student.reg_no == payload.reg_no)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or Register Number already registered")

    student = Student(
        full_name=payload.full_name,
        reg_no=payload.reg_no,
        roll_no=payload.roll_no,
        umis_id=payload.umis_id,
        department=payload.department,
        branch=payload.branch,
        class_id=payload.class_id,
        dob=payload.dob,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(student)
    db.commit()
    return {"message": "Student registered successfully"}


@router.post("/register/staff", response_model=MessageResponse)
def register_staff(payload: StaffRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Staff).filter(Staff.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role_type_normalized = payload.role_type.strip().lower()
    if role_type_normalized not in ("advisor", "subject", "both"):
        raise HTTPException(status_code=400, detail="role_type must be advisor, subject, or both")

    staff = Staff(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role_type=StaffRole(role_type_normalized),
        department=payload.department,
    )
    db.add(staff)
    db.commit()
    return {"message": "Staff registered successfully"}


@router.post("/register/admin", response_model=MessageResponse)
def register_admin(payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(Admin.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    admin = Admin(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        designation=payload.designation or "Principal",
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.user_type == "student":
        user = db.query(Student).filter(Student.email == payload.email).first()
    elif payload.user_type == "staff":
        user = db.query(Staff).filter(Staff.email == payload.email).first()
    elif payload.user_type == "admin":
        user = db.query(Admin).filter(Admin.email == payload.email).first()
    else:
        raise HTTPException(status_code=400, detail="user_type must be student, staff, or admin")

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(
        data={"sub": str(user.id), "user_type": payload.user_type}
    )
    return TokenResponse(
        access_token=token,
        user_type=payload.user_type,
        user_id=user.id,
        full_name=user.full_name,
    )