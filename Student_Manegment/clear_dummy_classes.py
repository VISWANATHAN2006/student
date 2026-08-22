import os
import sys

from app.database import SessionLocal
from app.models.academic import ClassGroup
import app.models.student  # noqa
import app.models.staff  # noqa
import app.models.academic_records  # noqa
import app.models.files  # noqa
import app.models.notification  # noqa
import app.models.admin  # noqa

def remove_dummy_classes():
    db = SessionLocal()
    try:
        from app.models.academic import Subject
        from app.models.academic_records import Attendance, Marks
        from app.models.staff import StaffClassAssignment, StaffSubjectAssignment
        from app.models.student import Student, PreRegisteredStudent
        from app.models.files import Note, QuestionBankItem

        dummy_names = ["m.sc", "cs", "siva", "msc"]
        for name in dummy_names:
            cls = db.query(ClassGroup).filter(ClassGroup.name.ilike(f"%{name}%")).all()
            for c in cls:
                print(f"Deleting dependencies for class: {c.name}")
                
                # Delete staff class assignments
                db.query(StaffClassAssignment).filter(StaffClassAssignment.class_id == c.id).delete()
                # Delete staff subject assignments
                db.query(StaffSubjectAssignment).filter(StaffSubjectAssignment.class_id == c.id).delete()
                # Delete students in this class
                students = db.query(Student).filter(Student.class_id == c.id).all()
                for st in students:
                    db.query(Attendance).filter(Attendance.student_id == st.id).delete()
                    db.query(Marks).filter(Marks.student_id == st.id).delete()
                    db.delete(st)
                
                # Delete pre-registered students in this class
                db.query(PreRegisteredStudent).filter(PreRegisteredStudent.class_id == c.id).delete()

                # Find subjects
                subjects = db.query(Subject).filter(Subject.class_id == c.id).all()
                for s in subjects:
                    # Delete attendance and marks for these subjects
                    db.query(Attendance).filter(Attendance.subject_id == s.id).delete()
                    db.query(Marks).filter(Marks.subject_id == s.id).delete()
                    # Delete files for these subjects
                    db.query(Note).filter(Note.subject_id == s.id).delete()
                    db.query(QuestionBankItem).filter(QuestionBankItem.subject_id == s.id).delete()
                    
                    db.delete(s)

                print(f"Deleting class: {c.name}")
                db.delete(c)
        db.commit()
        print("Dummy classes removed successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    remove_dummy_classes()
