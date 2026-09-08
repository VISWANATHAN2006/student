import unittest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

import app.models  # load all models
from app.database import Base
from app.models.academic import ClassGroup, Subject
from app.models.student import Student
from app.models.staff import Staff, StaffRole
from app.models.admin import Admin
from app.models.academic_records import Attendance, AttendanceStatus
from app.schemas.attendance import MarkAttendanceRequest, AttendanceMarkItem
from app.routers.attendance import (
    mark_attendance,
    get_student_attendance,
    get_attendance_summary,
    get_my_attendance,
    get_my_attendance_summary,
    get_class_low_attendance,
)


class TestAttendanceSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Clean tables
        self.db.query(Attendance).delete()
        self.db.query(Student).delete()
        self.db.query(Staff).delete()
        self.db.query(Admin).delete()
        self.db.query(Subject).delete()
        self.db.query(ClassGroup).delete()
        self.db.commit()

        # Seed data
        self.cg = ClassGroup(id=1, name="III BCA - A", department="Computer Applications")
        self.db.add(self.cg)

        self.sub1 = Subject(id=1, name="Java Programming", class_id=1)
        self.sub2 = Subject(id=2, name="DBMS", class_id=1)
        self.db.add_all([self.sub1, self.sub2])

        self.staff = Staff(
            id=1, full_name="Staff One", email="staff@test.com", password_hash="hash",
            role_type=StaffRole.both, department="Computer Applications"
        )
        self.admin = Admin(
            id=1, full_name="Admin One", email="admin@test.com", password_hash="hash",
            designation="Principal"
        )
        self.db.add_all([self.staff, self.admin])

        self.stu1 = Student(
            id=1, full_name="Student One", email="stu1@test.com", password_hash="hash",
            reg_no="REG001", roll_no="01", class_id=1
        )
        self.stu2 = Student(
            id=2, full_name="Student Two", email="stu2@test.com", password_hash="hash",
            reg_no="REG002", roll_no="02", class_id=1
        )
        self.db.add_all([self.stu1, self.stu2])
        self.db.commit()

        self.staff_ctx = {"user": self.staff, "user_type": "staff"}
        self.admin_ctx = {"user": self.admin, "user_type": "admin"}
        self.stu1_ctx = {"user": self.stu1, "user_type": "student"}
        self.stu2_ctx = {"user": self.stu2, "user_type": "student"}

    def tearDown(self):
        self.db.close()

    def test_mark_and_overwrite_attendance(self):
        # 1. Mark attendance as present
        payload = MarkAttendanceRequest(
            class_id=1,
            subject_id=1,
            date=date(2026, 3, 1),
            records=[AttendanceMarkItem(student_id=1, status="present")]
        )
        res = mark_attendance(payload, db=self.db, current=self.staff_ctx)
        self.assertIn("Attendance saved", res["message"])

        att = self.db.query(Attendance).filter(Attendance.student_id == 1).first()
        self.assertEqual(att.status, AttendanceStatus.present)
        self.assertEqual(att.subject_name, "Java Programming")

        # 2. Overwrite for the same date & subject as absent
        payload_overwrite = MarkAttendanceRequest(
            class_id=1,
            subject_id=1,
            date=date(2026, 3, 1),
            records=[AttendanceMarkItem(student_id=1, status="absent")]
        )
        mark_attendance(payload_overwrite, db=self.db, current=self.staff_ctx)
        att_updated = self.db.query(Attendance).filter(Attendance.student_id == 1).first()
        self.assertEqual(att_updated.status, AttendanceStatus.absent)

    def test_month_and_year_filtering(self):
        # Seed records for different months and years
        r1 = Attendance(student_id=1, subject_id=1, date=date(2026, 1, 15), status=AttendanceStatus.present, marked_by_staff_id=1)
        r2 = Attendance(student_id=1, subject_id=1, date=date(2026, 3, 10), status=AttendanceStatus.present, marked_by_staff_id=1)
        r3 = Attendance(student_id=1, subject_id=1, date=date(2025, 3, 10), status=AttendanceStatus.absent, marked_by_staff_id=1)
        self.db.add_all([r1, r2, r3])
        self.db.commit()

        # Month alone filter (March) -> should get 2026-03-10 and 2025-03-10
        mar_records = get_my_attendance(month=3, year=None, db=self.db, current=self.stu1_ctx)
        self.assertEqual(len(mar_records), 2)

        # Month + Year filter (March 2026) -> should get only 2026-03-10
        mar_2026_records = get_my_attendance(month=3, year=2026, db=self.db, current=self.stu1_ctx)
        self.assertEqual(len(mar_2026_records), 1)
        self.assertEqual(mar_2026_records[0].date, date(2026, 3, 10))

        # Year alone filter (2025) -> should get only 2025 record
        rec_2025 = get_my_attendance(month=None, year=2025, db=self.db, current=self.stu1_ctx)
        self.assertEqual(len(rec_2025), 1)
        self.assertEqual(rec_2025[0].date, date(2025, 3, 10))

    def test_summary_calculation_and_filtering(self):
        r1 = Attendance(student_id=1, subject_id=None, date=date(2026, 3, 1), status=AttendanceStatus.present, marked_by_staff_id=1)
        r2 = Attendance(student_id=1, subject_id=None, date=date(2026, 3, 2), status=AttendanceStatus.present, marked_by_staff_id=1)
        r3 = Attendance(student_id=1, subject_id=None, date=date(2026, 3, 3), status=AttendanceStatus.absent, marked_by_staff_id=1)
        r4 = Attendance(student_id=1, subject_id=None, date=date(2026, 3, 4), status=AttendanceStatus.leave, marked_by_staff_id=1)
        r5 = Attendance(student_id=1, subject_id=None, date=date(2026, 2, 1), status=AttendanceStatus.absent, marked_by_staff_id=1)
        self.db.add_all([r1, r2, r3, r4, r5])
        self.db.commit()

        # All-time summary (5 total: 2 present, 2 absent, 1 leave -> 40%)
        summary_all = get_my_attendance_summary(month=None, year=None, db=self.db, current=self.stu1_ctx)
        self.assertEqual(summary_all.total_marked, 5)
        self.assertEqual(summary_all.present, 2)
        self.assertEqual(summary_all.absent, 2)
        self.assertEqual(summary_all.leave, 1)
        self.assertEqual(summary_all.percentage, 40.0)

        # March summary (4 total: 2 present, 1 absent, 1 leave -> 50%)
        summary_mar = get_my_attendance_summary(month=3, year=2026, db=self.db, current=self.stu1_ctx)
        self.assertEqual(summary_mar.total_marked, 4)
        self.assertEqual(summary_mar.present, 2)
        self.assertEqual(summary_mar.absent, 1)
        self.assertEqual(summary_mar.leave, 1)
        self.assertEqual(summary_mar.percentage, 50.0)

    def test_student_cannot_view_other_student_attendance(self):
        # Stu1 trying to access Stu2's attendance records
        with self.assertRaises(HTTPException) as ctx:
            get_student_attendance(student_id=2, db=self.db, current=self.stu1_ctx)
        self.assertEqual(ctx.exception.status_code, 403)

        # Stu1 trying to access Stu2's attendance summary
        with self.assertRaises(HTTPException) as ctx:
            get_attendance_summary(student_id=2, db=self.db, current=self.stu1_ctx)
        self.assertEqual(ctx.exception.status_code, 403)

        # Staff can access any student
        res = get_student_attendance(student_id=2, db=self.db, current=self.staff_ctx)
        self.assertIsInstance(res, list)

    def test_low_attendance_detection(self):
        # Stu1: 1 present out of 2 = 50% (< 75%)
        # Stu2: 2 present out of 2 = 100% (>= 75%)
        self.db.add_all([
            Attendance(student_id=1, subject_id=None, date=date(2026, 3, 1), status=AttendanceStatus.present, marked_by_staff_id=1),
            Attendance(student_id=1, subject_id=None, date=date(2026, 3, 2), status=AttendanceStatus.absent, marked_by_staff_id=1),
            Attendance(student_id=2, subject_id=None, date=date(2026, 3, 1), status=AttendanceStatus.present, marked_by_staff_id=1),
            Attendance(student_id=2, subject_id=None, date=date(2026, 3, 2), status=AttendanceStatus.present, marked_by_staff_id=1),
        ])
        self.db.commit()

        low_list = get_class_low_attendance(class_id=1, threshold=75.0, db=self.db, current=self.staff_ctx)
        self.assertEqual(len(low_list), 1)
        self.assertEqual(low_list[0]["student_id"], 1)
        self.assertEqual(low_list[0]["percentage"], 50.0)


if __name__ == "__main__":
    unittest.main()
