from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_admin, get_current_user
from app.models.academic import ClassGroup, Subject
from app.schemas.academic import (
    ClassCreateRequest,
    ClassResponse,
    SubjectCreateRequest,
    SubjectResponse,
)

router = APIRouter()


@router.post("/classes", response_model=ClassResponse)
def create_class(payload: ClassCreateRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    existing = db.query(ClassGroup).filter(ClassGroup.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Class already exists")

    class_group = ClassGroup(name=payload.name, department=payload.department)
    db.add(class_group)
    db.commit()
    db.refresh(class_group)
    return class_group


@router.get("/classes", response_model=List[ClassResponse])
def list_classes(db: Session = Depends(get_db), current=Depends(get_current_user)):
    return db.query(ClassGroup).all()


@router.post("/subjects", response_model=SubjectResponse)
def create_subject(payload: SubjectCreateRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    class_group = db.query(ClassGroup).filter(ClassGroup.id == payload.class_id).first()
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")

    subject = Subject(name=payload.name, class_id=payload.class_id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/subjects", response_model=List[SubjectResponse])
def list_subjects(class_id: Optional[int] = None, db: Session = Depends(get_db), current=Depends(get_current_user)):
    query = db.query(Subject)
    if class_id is not None:
        query = query.filter(Subject.class_id == class_id)
    return query.all()