from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_staff, require_admin
from app.models.staff import Staff, StaffClassAssignment, StaffSubjectAssignment, StaffRole
from app.models.student import Student, PreRegisteredStudent
from app.models.academic_records import Marks
from app.schemas.dashboard import StaffDashboardResponse
from app.schemas.prereg import PreRegBulkCreateRequest, PreRegStudentResponse

router = APIRouter()


class AssignClassRequest(BaseModel):
    staff_id: int
    class_id: int


class AssignSubjectRequest(BaseModel):
    staff_id: int
    subject_id: int
    class_id: int


@router.post("/assign-class")
def assign_class(payload: AssignClassRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    """Assigns a staff member as Class Advisor for a class. Admin-only."""
    exists = (
        db.query(StaffClassAssignment)
        .filter(StaffClassAssignment.staff_id == payload.staff_id, StaffClassAssignment.class_id == payload.class_id)
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Already assigned")

    assignment = StaffClassAssignment(staff_id=payload.staff_id, class_id=payload.class_id)
    db.add(assignment)
    db.commit()
    return {"message": "Class assigned"}


@router.post("/assign-subject")
def assign_subject(payload: AssignSubjectRequest, db: Session = Depends(get_db), current=Depends(require_admin)):
    """Assigns a staff member to teach a subject in a class. Admin-only."""
    exists = (
        db.query(StaffSubjectAssignment)
        .filter(
            StaffSubjectAssignment.staff_id == payload.staff_id,
            StaffSubjectAssignment.subject_id == payload.subject_id,
            StaffSubjectAssignment.class_id == payload.class_id,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Already assigned")

    assignment = StaffSubjectAssignment(
        staff_id=payload.staff_id, subject_id=payload.subject_id, class_id=payload.class_id
    )
    db.add(assignment)
    db.commit()
    return {"message": "Subject assigned"}


@router.get("/me/dashboard", response_model=StaffDashboardResponse)
def get_staff_dashboard(
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    staff: Staff = current["user"]

    class_name = None
    total_students = 0
    subject_names = []
    pending_marks_count = 0

    if staff.role_type in (StaffRole.advisor, StaffRole.both):
        class_assignment = (
            db.query(StaffClassAssignment).filter(StaffClassAssignment.staff_id == staff.id).first()
        )
        if class_assignment:
            class_name = class_assignment.class_group.name
            total_students = db.query(Student).filter(Student.class_id == class_assignment.class_id).count()

    if staff.role_type in (StaffRole.subject, StaffRole.both):
        subject_assignments = (
            db.query(StaffSubjectAssignment).filter(StaffSubjectAssignment.staff_id == staff.id).all()
        )
        subject_names = [a.subject.name for a in subject_assignments]

        for a in subject_assignments:
            class_students = db.query(Student).filter(Student.class_id == a.class_id).all()
            students_with_marks = {
                m.student_id
                for m in db.query(Marks).filter(Marks.subject_id == a.subject_id).all()
            }
            pending_marks_count += sum(1 for s in class_students if s.id not in students_with_marks)

            if not total_students:
                total_students += len(class_students)

    return StaffDashboardResponse(
        full_name=staff.full_name,
        role_type=staff.role_type.value,
        class_name=class_name,
        subject_names=subject_names,
        total_students=total_students,
        pending_marks_count=pending_marks_count,
    )

@router.post("/pre-register", response_model=dict)
def bulk_pre_register_students(
    payload: PreRegBulkCreateRequest,
    db: Session = Depends(get_db),
    current=Depends(require_staff)
):
    staff: Staff = current["user"]
    added_count = 0
    
    for s in payload.students:
        existing = db.query(PreRegisteredStudent).filter(PreRegisteredStudent.reg_no == s.reg_no).first()
        if existing:
            existing.full_name = s.full_name
            existing.department = s.department
            existing.class_id = s.class_id
            existing.added_by_staff_id = staff.id
        else:
            new_reg = PreRegisteredStudent(
                reg_no=s.reg_no,
                full_name=s.full_name,
                department=s.department,
                class_id=s.class_id,
                added_by_staff_id=staff.id
            )
            db.add(new_reg)
        added_count += 1
        
    db.commit()
    return {"message": f"Successfully pre-registered {added_count} students."}

@router.get("/pre-register", response_model=List[PreRegStudentResponse])
def get_pre_registered_students(
    db: Session = Depends(get_db),
    current=Depends(require_staff)
):
    return db.query(PreRegisteredStudent).all()