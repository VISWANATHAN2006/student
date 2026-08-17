from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(200), nullable=False)  # e.g. "Unit 1 - Basics"
    file_url = Column(String(500), nullable=False)  # path or cloud URL to the PDF
    file_size_kb = Column(Integer, nullable=True)
    uploaded_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    subject = relationship("Subject")


class QuestionBankItem(Base):
    __tablename__ = "question_bank"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(200), nullable=False)  # e.g. "Important Questions"
    file_url = Column(String(500), nullable=False)
    file_size_kb = Column(Integer, nullable=True)
    uploaded_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    subject = relationship("Subject")
