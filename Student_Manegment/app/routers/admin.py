from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_admin
from app.models.student import Student
from app.models.staff import Staff, StaffClassAssignment
from app.models.academic import ClassGroup, Subject
from app.schemas.admin import (
    CollegeOverviewResponse,
    StaffOverviewItem,
    StudentOverviewItem,
    ClassOverviewItem,
)

router = APIRouter()


@router.get("/overview", response_model=CollegeOverviewResponse)
def get_college_overview(db: Session = Depends(get_db), current=Depends(require_admin)):
    return CollegeOverviewResponse(
        total_students=db.query(Student).count(),
        total_staff=db.query(Staff).count(),
        total_classes=db.query(ClassGroup).count(),
        total_subjects=db.query(Subject).count(),
    )


@router.get("/staff", response_model=List[StaffOverviewItem])
def list_all_staff(db: Session = Depends(get_db), current=Depends(require_admin)):
    staff_list = db.query(Staff).all()
    return [
        StaffOverviewItem(
            id=s.id,
            full_name=s.full_name,
            email=s.email,
            role_type=s.role_type.value,
            department=s.department,
        )
        for s in staff_list
    ]


@router.get("/students", response_model=List[StudentOverviewItem])
def list_all_students(db: Session = Depends(get_db), current=Depends(require_admin)):
    students = db.query(Student).all()
    return [
        StudentOverviewItem(
            id=s.id,
            full_name=s.full_name,
            reg_no=s.reg_no,
            class_name=s.class_group.name if s.class_group else "",
            email=s.email,
        )
        for s in students
    ]


@router.get("/classes", response_model=List[ClassOverviewItem])
def list_all_classes_overview(db: Session = Depends(get_db), current=Depends(require_admin)):
    classes = db.query(ClassGroup).all()
    result = []
    for c in classes:
        student_count = db.query(Student).filter(Student.class_id == c.id).count()
        advisor_assignment = (
            db.query(StaffClassAssignment).filter(StaffClassAssignment.class_id == c.id).first()
        )
        advisor_name = advisor_assignment.staff.full_name if advisor_assignment else None
        result.append(
            ClassOverviewItem(
                id=c.id,
                name=c.name,
                department=c.department,
                student_count=student_count,
                advisor_name=advisor_name,
            )
        )
    return result