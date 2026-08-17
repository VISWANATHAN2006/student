from datetime import datetime
from pydantic import BaseModel


class FileItemResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    file_url: str
    file_size_kb: int | None = None
    uploaded_by_staff_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
