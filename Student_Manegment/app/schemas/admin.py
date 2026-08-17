from typing import List
from pydantic import BaseModel


class CollegeOverviewResponse(BaseModel):
    total_students: int
    total_staff: int
    total_classes: int
    total_subjects: int


class StaffOverviewItem(BaseModel):
    id: int
    full_name: str
    email: str
    role_type: str
    department: str | None = None

    class Config:
        from_attributes = True


class StudentOverviewItem(BaseModel):
    id: int
    full_name: str
    reg_no: str
    class_name: str
    email: str

    class Config:
        from_attributes = True


class ClassOverviewItem(BaseModel):
    id: int
    name: str
    department: str | None = None
    student_count: int
    advisor_name: str | None = None