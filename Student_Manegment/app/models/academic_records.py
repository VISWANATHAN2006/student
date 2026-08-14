import enum

from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, func, Enum, Float
from sqlalchemy.orm import relationship

from app.database import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    leave = "leave"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)  # null = whole-day marking
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    marked_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)

    student = relationship("Student")
    subject = relationship("Subject")


class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    assessment_type = Column(String(50), nullable=False)  # e.g. "Internal - Assessment 1", "External"
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False)
    entered_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    student = relationship("Student")
    subject = relationship("Subject")
