from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_student
from app.models.student import Student
from app.models.academic import Subject
from app.models.academic_records import Attendance, AttendanceStatus, Marks
from app.models.notification import Notification, NotificationTarget
from app.schemas.dashboard import StudentDashboardResponse

router = APIRouter()


@router.get("/me/dashboard", response_model=StudentDashboardResponse)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current=Depends(require_student),
):
    student: Student = current["user"]

    # Attendance %
    records = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    total_marked = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.present)
    attendance_percentage = round((present / total_marked) * 100, 2) if total_marked > 0 else 0.0

    # Marks totals
    marks_rows = db.query(Marks).filter(Marks.student_id == student.id).all()
    total_obtained = sum(m.marks_obtained for m in marks_rows)
    total_max = sum(m.max_marks for m in marks_rows)

    # Subjects in their class
    subject_count = db.query(Subject).filter(Subject.class_id == student.class_id).count()

    # Notifications relevant to them (no read/unread tracking table yet, so this is "total relevant")
    subject_ids = [s.id for s in db.query(Subject).filter(Subject.class_id == student.class_id).all()]
    notification_count = (
        db.query(Notification)
        .filter(
            (Notification.target_type == NotificationTarget.all)
            | ((Notification.target_type == NotificationTarget.class_) & (Notification.target_id == student.class_id))
            | ((Notification.target_type == NotificationTarget.subject) & (Notification.target_id.in_(subject_ids)))
        )
        .count()
    )

    return StudentDashboardResponse(
        full_name=student.full_name,
        reg_no=student.reg_no,
        class_name=student.class_group.name if student.class_group else "",
        attendance_percentage=attendance_percentage,
        total_marks_obtained=total_obtained,
        total_max_marks=total_max,
        subject_count=subject_count,
        unread_notification_count=notification_count,
    )
