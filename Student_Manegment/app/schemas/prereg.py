from typing import Optional, List
from pydantic import BaseModel

class PreRegStudentCreate(BaseModel):
    reg_no: str
    full_name: str
    department: Optional[str] = None
    class_id: Optional[int] = None

class PreRegStudentResponse(BaseModel):
    id: int
    reg_no: str
    full_name: str
    department: Optional[str] = None
    class_id: Optional[int] = None
    added_by_staff_id: Optional[int] = None

    class Config:
        from_attributes = True

class PreRegBulkCreateRequest(BaseModel):
    students: List[PreRegStudentCreate]
