from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AnnouncementCreateRequest(BaseModel):
    title: str
    body: str
    target_type: str  # "all" | "class" | "subject"
    target_id: Optional[int] = None  # class_id or subject_id; omit when target_type is "all"


class NotificationResponse(BaseModel):
    id: int
    title: str
    body: str
    target_type: str
    target_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
