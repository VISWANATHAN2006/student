import enum

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class StaffRole(str, enum.Enum):
    advisor = "advisor"
    subject = "subject"
    both = "both"


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_type = Column(Enum(StaffRole), nullable=False)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    class_assignments = relationship("StaffClassAssignment", back_populates="staff")
    subject_assignments = relationship("StaffSubjectAssignment", back_populates="staff")


class StaffClassAssignment(Base):
    """Which class a staff member is the Class Advisor for."""
    __tablename__ = "staff_class_assignments"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    staff = relationship("Staff", back_populates="class_assignments")
    class_group = relationship("ClassGroup")


class StaffSubjectAssignment(Base):
    """Which subject (in which class) a staff member teaches as Subject Staff."""
    __tablename__ = "staff_subject_assignments"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    staff = relationship("Staff", back_populates="subject_assignments")
    subject = relationship("Subject")
    class_group = relationship("ClassGroup")
