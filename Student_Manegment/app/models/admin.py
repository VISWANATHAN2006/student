from sqlalchemy import Column, Integer, String, DateTime, func

from app.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    designation = Column(String(100), default="Principal")
    created_at = Column(DateTime, server_default=func.now())