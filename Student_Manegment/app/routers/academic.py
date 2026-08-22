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
    DepartmentCreateRequest,
    DepartmentResponse,
    DepartmentUpdateRequest,
    ClassUpdateRequest,
    SubjectUpdateRequest
)

from app.models.academic import Department

router = APIRouter()


@router.post("/departments", response_model=DepartmentResponse)
def create_department(payload: DepartmentCreateRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    existing = db.query(Department).filter(Department.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    dept = Department(name=payload.name)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

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
def list_classes(db: Session = Depends(get_db)):
    print('list_classes CALLED')
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

@router.put("/departments/{department_id}", response_model=DepartmentResponse)
def update_department(department_id: int, payload: DepartmentUpdateRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    dept.name = payload.name
    db.commit()
    db.refresh(dept)
    return dept

@router.put("/classes/{class_id}", response_model=ClassResponse)
def update_class(class_id: int, payload: ClassUpdateRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    class_group = db.query(ClassGroup).filter(ClassGroup.id == class_id).first()
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if payload.name is not None:
        class_group.name = payload.name
    if payload.department is not None:
        class_group.department = payload.department
        
    db.commit()
    db.refresh(class_group)
    return class_group

@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
def update_subject(subject_id: int, payload: SubjectUpdateRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    if payload.name is not None:
        subject.name = payload.name
    if payload.class_id is not None:
        # Validate that the class exists
        class_group = db.query(ClassGroup).filter(ClassGroup.id == payload.class_id).first()
        if not class_group:
            raise HTTPException(status_code=404, detail="Class not found")
        subject.class_id = payload.class_id
        
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db), current=Depends(require_admin)):
    try:
        dept = db.query(Department).filter(Department.id == department_id).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
        db.delete(dept)
        db.commit()
        return {"detail": "Department deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete department. It may be in use.")

@router.delete("/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db), current=Depends(require_admin)):
    try:
        class_group = db.query(ClassGroup).filter(ClassGroup.id == class_id).first()
        if not class_group:
            raise HTTPException(status_code=404, detail="Class not found")
        db.delete(class_group)
        db.commit()
        return {"detail": "Class deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete class. Remove assigned students and subjects first.")

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db), current=Depends(require_admin)):
    try:
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        db.delete(subject)
        db.commit()
        return {"detail": "Subject deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete subject.")