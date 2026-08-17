from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_staff
from app.models.files import Note
from app.schemas.files import FileItemResponse
from app.services.storage_service import save_uploaded_file

router = APIRouter()


@router.post("/upload", response_model=FileItemResponse)
def upload_note(
    subject_id: int = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    staff = current["user"]
    try:
        file_url, size_kb = save_uploaded_file(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    note = Note(
        subject_id=subject_id,
        title=title,
        file_url=file_url,
        file_size_kb=size_kb,
        uploaded_by_staff_id=staff.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("", response_model=List[FileItemResponse])
def list_notes(
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    query = db.query(Note)
    if subject_id is not None:
        query = query.filter(Note.subject_id == subject_id)
    return query.order_by(Note.uploaded_at.desc()).all()
