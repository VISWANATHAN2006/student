from typing import List, Optional
from pydantic import BaseModel


class StudentDashboardResponse(BaseModel):
    full_name: str
    reg_no: str
    class_name: str
    attendance_percentage: float
    total_marks_obtained: float
    total_max_marks: float
    subject_count: int
    unread_notification_count: int


class StaffDashboardResponse(BaseModel):
    full_name: str
    role_type: str
    class_name: Optional[str] = None
    subject_names: List[str] = []
    total_students: int
    pending_marks_count: int
