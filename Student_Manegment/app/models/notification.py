import enum

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Enum, Text
from sqlalchemy.orm import relationship

from app.database import Base


class NotificationTarget(str, enum.Enum):
    all = "all"          # every student
    class_ = "class"      # one class
    subject = "subject"  # everyone taking one subject


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    target_type = Column(Enum(NotificationTarget), nullable=False)
    target_id = Column(Integer, nullable=True)  # class_id or subject_id, null when target_type = all
    created_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    staff = relationship("Staff")
