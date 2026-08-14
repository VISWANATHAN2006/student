from datetime import date as date_type
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_staff
from app.models.academic_records import Attendance, AttendanceStatus
from app.schemas.attendance import (
    MarkAttendanceRequest,
    AttendanceResponse,
    AttendanceSummaryResponse,
)

router = APIRouter()


@router.post("/mark", response_model=dict)
def mark_attendance(
    payload: MarkAttendanceRequest,
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    staff = current["user"]
    saved = 0
    for record in payload.records:
        if record.status not in ("present", "absent", "leave"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{record.status}' for student_id {record.student_id}",
            )

        # Overwrite if attendance for this student/subject/date already exists
        existing = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == record.student_id,
                Attendance.subject_id == payload.subject_id,
                Attendance.date == payload.date,
            )
            .first()
        )
        if existing:
            existing.status = AttendanceStatus(record.status)
        else:
            db.add(
                Attendance(
                    student_id=record.student_id,
                    subject_id=payload.subject_id,
                    date=payload.date,
                    status=AttendanceStatus(record.status),
                    marked_by_staff_id=staff.id,
                )
            )
        saved += 1

    db.commit()
    return {"message": f"Attendance saved for {saved} students"}


@router.get("/student/{student_id}", response_model=List[AttendanceResponse])
def get_student_attendance(
    student_id: int,
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    query = db.query(Attendance).filter(Attendance.student_id == student_id)
    if month and year:
        query = query.filter(
            extract("month", Attendance.date) == month,
            extract("year", Attendance.date) == year,
        )
    return query.order_by(Attendance.date).all()


@router.get("/student/{student_id}/summary", response_model=AttendanceSummaryResponse)
def get_attendance_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
    leave = sum(1 for r in records if r.status == AttendanceStatus.leave)
    percentage = round((present / total) * 100, 2) if total > 0 else 0.0

    return AttendanceSummaryResponse(
        total_marked=total, present=present, absent=absent, leave=leave, percentage=percentage
    )
