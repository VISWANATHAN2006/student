from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)


class ClassGroup(Base):
    """A class section, e.g. 'A' or '2nd Year - A' within a department"""
    __tablename__ = "classes"
    __table_args__ = (
        UniqueConstraint("name", "department", name="uq_class_dept"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    department = Column(String(100), nullable=True)

    subjects = relationship("Subject", back_populates="class_group")
    students = relationship("Student", back_populates="class_group")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g. "Java Programming"
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    class_group = relationship("ClassGroup", back_populates="subjects")
