from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_staff_or_admin
from app.models.notification import Notification, NotificationTarget
from app.models.student import Student
from app.models.academic import Subject
from app.schemas.notification import AnnouncementCreateRequest, NotificationResponse

router = APIRouter()


@router.post("/send", response_model=NotificationResponse)
def send_announcement(
    payload: AnnouncementCreateRequest,
    db: Session = Depends(get_db),
    current=Depends(require_staff_or_admin),
):
    user = current["user"]
    user_type = current["user_type"]

    if payload.target_type not in ("all", "class", "subject"):
        raise HTTPException(status_code=400, detail="target_type must be all, class, or subject")
    if payload.target_type != "all" and payload.target_id is None:
        raise HTTPException(status_code=400, detail="target_id is required when target_type is class or subject")

    target_enum = NotificationTarget.class_ if payload.target_type == "class" else NotificationTarget(payload.target_type)

    notification = Notification(
        title=payload.title,
        body=payload.body,
        target_type=target_enum,
        target_id=payload.target_id,
        created_by_staff_id=user.id if user_type == "staff" else None,
        created_by_admin_id=user.id if user_type == "admin" else None,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/me", response_model=List[NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    """Returns notifications relevant to the logged-in user.
    Students: 'all' notices + their class's notices + notices for subjects in their class.
    Staff: 'all' notices + notices they sent themselves.
    """
    user = current["user"]
    user_type = current["user_type"]

    query = db.query(Notification)

    if user_type == "student":
        student = db.query(Student).filter(Student.id == user.id).first()
        subject_ids = [s.id for s in db.query(Subject).filter(Subject.class_id == student.class_id).all()]

        notifications = query.filter(
            (Notification.target_type == NotificationTarget.all)
            | ((Notification.target_type == NotificationTarget.class_) & (Notification.target_id == student.class_id))
            | ((Notification.target_type == NotificationTarget.subject) & (Notification.target_id.in_(subject_ids)))
        ).order_by(Notification.created_at.desc()).all()
    elif user_type == "staff":
        notifications = query.filter(
            (Notification.target_type == NotificationTarget.all)
            | (Notification.created_by_staff_id == user.id)
        ).order_by(Notification.created_at.desc()).all()
    else:
        # admin can see all notifications
        notifications = query.order_by(Notification.created_at.desc()).all()

    return notifications
