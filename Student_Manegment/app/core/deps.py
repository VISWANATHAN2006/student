from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token
from app.models.student import Student
from app.models.staff import Staff
from app.models.admin import Admin

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    user_type = payload.get("user_type")
    if user_id is None or user_type is None:
        raise credentials_exception

    if user_type == "student":
        user = db.query(Student).filter(Student.id == int(user_id)).first()
    elif user_type == "staff":
        user = db.query(Staff).filter(Staff.id == int(user_id)).first()
    elif user_type == "admin":
        user = db.query(Admin).filter(Admin.id == int(user_id)).first()
    else:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return {"user": user, "user_type": user_type}


def require_staff(current=Depends(get_current_user)):
    if current["user_type"] != "staff":
        raise HTTPException(status_code=403, detail="Staff access only")
    return current


def require_student(current=Depends(get_current_user)):
    if current["user_type"] != "student":
        raise HTTPException(status_code=403, detail="Student access only")
    return current


def require_admin(current=Depends(get_current_user)):
    if current["user_type"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return current


def require_staff_or_admin(current=Depends(get_current_user)):
    if current["user_type"] not in ("staff", "admin"):
        raise HTTPException(status_code=403, detail="Staff or Admin access only")
    return current