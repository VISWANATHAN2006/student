from typing import Optional
from pydantic import BaseModel


class ClassCreateRequest(BaseModel):
    name: str  # e.g. "III BCA - A"
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


class SubjectResponse(BaseModel):
    id: int
    name: str
    class_id: int

    class Config:
        from_attributes = True
