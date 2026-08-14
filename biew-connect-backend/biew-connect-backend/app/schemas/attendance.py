from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class AttendanceMarkItem(BaseModel):
    student_id: int
    status: str  # "present" | "absent" | "leave"


class MarkAttendanceRequest(BaseModel):
    class_id: int
    subject_id: Optional[int] = None  # None = whole-day attendance
    date: date
    records: List[AttendanceMarkItem]


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    subject_id: Optional[int]
    date: date
    status: str

    class Config:
        from_attributes = True


class AttendanceSummaryResponse(BaseModel):
    total_marked: int
    present: int
    absent: int
    leave: int
    percentage: float
