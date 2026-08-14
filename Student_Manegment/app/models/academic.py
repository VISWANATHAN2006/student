from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ClassGroup(Base):
    """A class section, e.g. 'III BCA - A'"""
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # e.g. "III BCA - A"
    department = Column(String(100), nullable=True)

    subjects = relationship("Subject", back_populates="class_group")
    students = relationship("Student", back_populates="class_group")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g. "Java Programming"
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    class_group = relationship("ClassGroup", back_populates="subjects")
