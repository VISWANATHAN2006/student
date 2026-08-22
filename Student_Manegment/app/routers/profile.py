from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import os
import shutil
import uuid
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.models.student import Student
from app.models.staff import Staff
from app.models.admin import Admin
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.post("/picture", response_model=MessageResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user_info: dict = Depends(get_current_user)
):
    user_id = current_user_info.get("user_id")
    user_type = current_user_info.get("user_type")

    if not user_id or not user_type:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png"]:
        raise HTTPException(status_code=400, detail="Only JPG and PNG files are allowed")

    # Create directory if it doesn't exist
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "profiles")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    filename = f"{user_type}_{user_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/uploads/profiles/{filename}"

    # Update database
    if user_type == "student":
        user = db.query(Student).filter(Student.id == user_id).first()
    elif user_type == "staff":
        user = db.query(Staff).filter(Staff.id == user_id).first()
    elif user_type == "admin":
        user = db.query(Admin).filter(Admin.id == user_id).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid user type")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.profile_picture_url = file_url
    db.commit()

    return {"message": "Profile picture updated successfully"}
