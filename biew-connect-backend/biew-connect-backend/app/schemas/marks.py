from typing import List, Optional
from pydantic import BaseModel


class AddMarksRequest(BaseModel):
    student_id: int
    subject_id: int
    assessment_type: str
    marks_obtained: float
    max_marks: float


class MarksResponse(BaseModel):
    id: int
    student_id: int
    subject_id: int
    assessment_type: str
    marks_obtained: float
    max_marks: float

    class Config:
        from_attributes = True


class BulkUploadRowResult(BaseModel):
    reg_no: str
    status: str  # "valid" | "error"
    reason: Optional[str] = None


class BulkUploadResponse(BaseModel):
    total_rows: int
    saved: int
    errors: List[BulkUploadRowResult]
