from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base


class PreRegisteredStudent(Base):
    __tablename__ = "pre_registered_students"

    id = Column(Integer, primary_key=True, index=True)
    reg_no = Column(String(30), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    added_by_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    reg_no = Column(String(30), unique=True, nullable=False, index=True)
    roll_no = Column(String(20), nullable=False)
    umis_id = Column(String(30), unique=True, nullable=True)
    department = Column(String(100), nullable=True)
    branch = Column(String(50), nullable=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    dob = Column(Date, nullable=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    profile_picture_url = Column(String(255), nullable=True)

    class_group = relationship("ClassGroup", back_populates="students")
