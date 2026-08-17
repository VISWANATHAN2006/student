from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_staff
from app.models.academic_records import Marks
from app.models.student import Student
from app.schemas.marks import AddMarksRequest, MarksResponse, BulkUploadResponse, ClassMarksSheetResponse, ClassMarksSheetRow
from app.services.excel_service import process_bulk_marks_excel

router = APIRouter()


@router.post("/add", response_model=MarksResponse)
def add_marks(
    payload: AddMarksRequest,
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    staff = current["user"]

    existing = (
        db.query(Marks)
        .filter(
            Marks.student_id == payload.student_id,
            Marks.subject_id == payload.subject_id,
            Marks.assessment_type == payload.assessment_type,
        )
        .first()
    )
    if existing:
        existing.marks_obtained = payload.marks_obtained
        existing.max_marks = payload.max_marks
        db.commit()
        db.refresh(existing)
        return existing

    marks = Marks(
        student_id=payload.student_id,
        subject_id=payload.subject_id,
        assessment_type=payload.assessment_type,
        marks_obtained=payload.marks_obtained,
        max_marks=payload.max_marks,
        entered_by_staff_id=staff.id,
    )
    db.add(marks)
    db.commit()
    db.refresh(marks)
    return marks


@router.get("/student/{student_id}", response_model=List[MarksResponse])
def get_student_marks(
    student_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["user_type"] == "student" and current["user"].id != student_id:
        raise HTTPException(status_code=403, detail="You can only view your own marks")

    return db.query(Marks).filter(Marks.student_id == student_id).all()


@router.get("/class/{class_id}/subject/{subject_id}/sheet", response_model=ClassMarksSheetResponse)
def get_class_marks_sheet(
    class_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    students = db.query(Student).filter(Student.class_id == class_id).order_by(Student.roll_no).all()
    all_marks = db.query(Marks).filter(Marks.subject_id == subject_id).all()

    marks_by_student: dict[int, dict[str, float]] = {}
    assessment_types: list[str] = []
    for m in all_marks:
        marks_by_student.setdefault(m.student_id, {})[m.assessment_type] = m.marks_obtained
        if m.assessment_type not in assessment_types:
            assessment_types.append(m.assessment_type)
    assessment_types.sort()

    rows = []
    for s in students:
        student_marks = marks_by_student.get(s.id, {})
        total = sum(student_marks.values())
        rows.append(
            ClassMarksSheetRow(
                student_id=s.id,
                reg_no=s.reg_no,
                full_name=s.full_name,
                marks={col: student_marks.get(col) for col in assessment_types},
                total=total,
            )
        )

    return ClassMarksSheetResponse(assessment_columns=assessment_types, rows=rows)


@router.post("/bulk-upload", response_model=BulkUploadResponse)
def bulk_upload_marks(
    subject_id: int = Form(...),
    class_id: int = Form(...),
    max_marks_per_assessment: float = Form(20),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current=Depends(require_staff),
):
    staff = current["user"]

    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files are supported")

    file_bytes = file.file.read()

    try:
        saved, results = process_bulk_marks_excel(
            file_bytes=file_bytes,
            subject_id=subject_id,
            class_id=class_id,
            max_marks_per_assessment=max_marks_per_assessment,
            entered_by_staff_id=staff.id,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    errors = [r for r in results if r.status == "error"]
    return BulkUploadResponse(total_rows=len(results) + 0, saved=saved, errors=errors)