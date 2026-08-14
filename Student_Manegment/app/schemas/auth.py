from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


class StudentRegisterRequest(BaseModel):
    full_name: str
    reg_no: str
    roll_no: str
    umis_id: Optional[str] = None
    department: Optional[str] = None
    branch: Optional[str] = None
    class_id: int
    dob: Optional[date] = None
    email: EmailStr
    password: str


class StaffRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role_type: str  # "advisor" | "subject" | "both"
    department: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    user_type: str  # "student" | "staff"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str
    user_id: int
    full_name: str


class MessageResponse(BaseModel):
    message: str
