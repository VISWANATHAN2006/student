import io
from typing import List, Tuple

import pandas as pd
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.academic_records import Marks
from app.schemas.marks import BulkUploadRowResult

REQUIRED_COLUMNS = {"Reg No", "Assessment 1", "Assessment 2", "Assessment 3"}


def process_bulk_marks_excel(
    file_bytes: bytes,
    subject_id: int,
    class_id: int,
    max_marks_per_assessment: float,
    entered_by_staff_id: int,
    db: Session,
) -> Tuple[int, List[BulkUploadRowResult]]:
    df = pd.read_excel(io.BytesIO(file_bytes))

    missing_cols = REQUIRED_COLUMNS - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing columns in Excel file: {', '.join(missing_cols)}")

    results: List[BulkUploadRowResult] = []
    saved_count = 0

    for _, row in df.iterrows():
        reg_no = str(row["Reg No"]).strip()

        student = (
            db.query(Student)
            .filter(Student.reg_no == reg_no, Student.class_id == class_id)
            .first()
        )
        if not student:
            results.append(
                BulkUploadRowResult(reg_no=reg_no, status="error", reason="Reg No not found in this class")
            )
            continue

        assessment_values = {}
        row_has_error = False
        for i in (1, 2, 3):
            col = f"Assessment {i}"
            try:
                value = float(row[col])
            except (ValueError, TypeError):
                results.append(
                    BulkUploadRowResult(reg_no=reg_no, status="error", reason=f"{col} is not a number")
                )
                row_has_error = True
                break
            if value < 0 or value > max_marks_per_assessment:
                results.append(
                    BulkUploadRowResult(
                        reg_no=reg_no,
                        status="error",
                        reason=f"{col} exceeds max ({max_marks_per_assessment})",
                    )
                )
                row_has_error = True
                break
            assessment_values[i] = value

        if row_has_error:
            continue

        # Save each assessment as its own Marks row (overwrite if already exists)
        for i, value in assessment_values.items():
            assessment_label = f"Internal - Assessment {i}"
            existing = (
                db.query(Marks)
                .filter(
                    Marks.student_id == student.id,
                    Marks.subject_id == subject_id,
                    Marks.assessment_type == assessment_label,
                )
                .first()
            )
            if existing:
                existing.marks_obtained = value
                existing.max_marks = max_marks_per_assessment
            else:
                db.add(
                    Marks(
                        student_id=student.id,
                        subject_id=subject_id,
                        assessment_type=assessment_label,
                        marks_obtained=value,
                        max_marks=max_marks_per_assessment,
                        entered_by_staff_id=entered_by_staff_id,
                    )
                )

        results.append(BulkUploadRowResult(reg_no=reg_no, status="valid"))
        saved_count += 1

    db.commit()
    return saved_count, results
