from typing import Optional
from pydantic import BaseModel
from app.database import Base


class DepartmentCreateRequest(BaseModel):
    name: str

class DepartmentUpdateRequest(BaseModel):
    name: str

class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ClassCreateRequest(BaseModel):
    name: str  # e.g. "III BCA - A"
    department: Optional[str] = None

class ClassUpdateRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None

class ClassResponse(BaseModel):
    id: int
    name: str
    department: Optional[str] = None

    class Config:
        from_attributes = True


class SubjectCreateRequest(BaseModel):
    name: str
    class_id: int

class SubjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    class_id: Optional[int] = None

class SubjectResponse(BaseModel):
    id: int
    name: str
    class_id: int

    class Config:
        from_attributes = True
