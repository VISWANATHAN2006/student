import unittest
import io
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException, UploadFile
from fastapi.datastructures import Headers

import app.models  # Register all models in SQLAlchemy registry
from app.database import Base
from app.models.academic import Department, ClassGroup, Subject
from app.models.student import Student, PreRegisteredStudent
from app.models.staff import Staff, StaffClassAssignment, StaffSubjectAssignment, StaffRole
from app.models.admin import Admin
from app.models.academic_records import Attendance, AttendanceStatus, Marks
from app.models.files import Note, QuestionBankItem
from app.models.notification import Notification, NotificationTarget

# Routers
from app.routers.auth import (
    register_student, register_staff, register_admin, login,
    check_email_availability
)
from app.routers.academic import (
    create_department, list_departments, update_department,
    create_class, list_classes, update_class,
    create_subject, list_subjects
)
from app.routers.staff import (
    bulk_pre_register_students, get_pre_registered_students,
    assign_class, assign_subject, get_staff_dashboard,
    AssignClassRequest, AssignSubjectRequest
)
from app.routers.attendance import (
    mark_attendance, get_my_attendance, get_my_attendance_summary,
    get_student_attendance, get_attendance_summary,
    get_class_low_attendance, notify_low_attendance
)
from app.routers.marks import (
    add_marks, get_student_marks, get_class_marks_sheet, bulk_upload_marks
)
from app.routers.notes import upload_note, list_notes
from app.routers.question_bank import upload_question_bank_item, list_question_bank
from app.routers.notifications import send_announcement, get_my_notifications
from app.routers.students import get_student_dashboard
from app.routers.profile import upload_profile_picture
from app.routers.admin import (
    get_college_overview, list_all_staff, list_all_students, list_all_classes_overview
)

# Schemas
from app.schemas.auth import (
    StudentRegisterRequest, StaffRegisterRequest, AdminRegisterRequest, LoginRequest
)
from app.schemas.academic import (
    DepartmentCreateRequest, DepartmentUpdateRequest,
    ClassCreateRequest, ClassUpdateRequest, SubjectCreateRequest
)
from app.schemas.prereg import PreRegBulkCreateRequest, PreRegStudentCreate
from app.schemas.attendance import MarkAttendanceRequest, AttendanceMarkItem
from app.schemas.marks import AddMarksRequest
from app.schemas.notification import AnnouncementCreateRequest


class TestFullStudentManagementSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Clean all tables in correct order
        self.db.query(Attendance).delete()
        self.db.query(Marks).delete()
        self.db.query(Note).delete()
        self.db.query(QuestionBankItem).delete()
        self.db.query(Notification).delete()
        self.db.query(StaffClassAssignment).delete()
        self.db.query(StaffSubjectAssignment).delete()
        self.db.query(Student).delete()
        self.db.query(PreRegisteredStudent).delete()
        self.db.query(Staff).delete()
        self.db.query(Admin).delete()
        self.db.query(Subject).delete()
        self.db.query(ClassGroup).delete()
        self.db.query(Department).delete()
        self.db.commit()

        # Seed initial Admin and Staff
        self.admin = Admin(
            id=1, full_name="Super Admin", email="admin@biew.edu.in",
            password_hash="$2b$12$dummyadminhash", designation="Principal"
        )
        self.staff1 = Staff(
            id=1, full_name="Dr. Alan Turing", email="alan@biew.edu.in",
            password_hash="$2b$12$dummystaffhash", role_type=StaffRole.both,
            department="Computer Science"
        )
        self.staff2 = Staff(
            id=2, full_name="Prof. Grace Hopper", email="grace@biew.edu.in",
            password_hash="$2b$12$dummystaffhash", role_type=StaffRole.subject,
            department="Information Technology"
        )
        self.db.add_all([self.admin, self.staff1, self.staff2])
        self.db.commit()

        # Context helpers
        self.admin_ctx = {"user": self.admin, "user_type": "admin"}
        self.staff1_ctx = {"user": self.staff1, "user_type": "staff"}
        self.staff2_ctx = {"user": self.staff2, "user_type": "staff"}

    def tearDown(self):
        self.db.close()

    # ─────────────────────────────────────────────────────────────
    # 1. ACADEMIC STRUCTURE (Departments, Classes, Subjects)
    # ─────────────────────────────────────────────────────────────
    def test_academic_structure_lifecycle(self):
        # 1. Create Department
        dept = create_department(DepartmentCreateRequest(name="Computer Science"), db=self.db, current=self.admin_ctx)
        self.assertEqual(dept.name, "Computer Science")

        # Duplicate department should fail
        with self.assertRaises(HTTPException) as cm:
            create_department(DepartmentCreateRequest(name="Computer Science"), db=self.db, current=self.admin_ctx)
        self.assertEqual(cm.exception.status_code, 400)

        # Update department
        dept_updated = update_department(dept.id, DepartmentUpdateRequest(name="Computer Science & Engineering"), db=self.db, current=self.admin_ctx)
        self.assertEqual(dept_updated.name, "Computer Science & Engineering")

        # List departments
        depts = list_departments(db=self.db)
        self.assertEqual(len(depts), 1)

        # 2. Create Class
        cg = create_class(ClassCreateRequest(name="III CSE - A", department="Computer Science & Engineering"), db=self.db, current=self.admin_ctx)
        self.assertEqual(cg.name, "III CSE - A")

        # Duplicate class should fail
        with self.assertRaises(HTTPException) as cm:
            create_class(ClassCreateRequest(name="III CSE - A", department="Computer Science & Engineering"), db=self.db, current=self.admin_ctx)
        self.assertEqual(cm.exception.status_code, 400)

        # Update class
        cg_up = update_class(cg.id, ClassUpdateRequest(name="III CSE - Section A"), db=self.db, current=self.admin_ctx)
        self.assertEqual(cg_up.name, "III CSE - Section A")

        # 3. Create Subjects
        sub1 = create_subject(SubjectCreateRequest(name="Algorithms", class_id=cg.id), db=self.db, current=self.admin_ctx)
        sub2 = create_subject(SubjectCreateRequest(name="Operating Systems", class_id=cg.id), db=self.db, current=self.admin_ctx)
        self.assertEqual(sub1.name, "Algorithms")

        # Create subject under invalid class should fail (404)
        with self.assertRaises(HTTPException) as cm:
            create_subject(SubjectCreateRequest(name="Phantom Subject", class_id=9999), db=self.db, current=self.admin_ctx)
        self.assertEqual(cm.exception.status_code, 404)

        # List subjects filtered by class
        subs = list_subjects(class_id=cg.id, db=self.db, current=self.admin_ctx)
        self.assertEqual(len(subs), 2)

    # ─────────────────────────────────────────────────────────────
    # 2. AUTHENTICATION, PRE-REGISTRATION & ACCESS CONTROL
    # ─────────────────────────────────────────────────────────────
    def test_auth_registration_and_login_flows(self):
        # Setup class
        cg = ClassGroup(id=1, name="III CSE - A", department="Computer Science")
        self.db.add(cg)
        self.db.commit()

        # Check email availability (initially available)
        avail = check_email_availability("alice@biew.edu.in", db=self.db)
        self.assertFalse(avail["exists"])

        # Attempt to register student without pre-registration -> should fail (403)
        stu_req = StudentRegisterRequest(
            full_name="Alice Lovelace", reg_no="REG-ALICE", roll_no="CSE01",
            class_id=1, email="alice@biew.edu.in", password="Password@123"
        )
        with self.assertRaises(HTTPException) as cm:
            register_student(stu_req, db=self.db)
        self.assertEqual(cm.exception.status_code, 403)
        self.assertIn("not authorized for registration", cm.exception.detail)

        # Staff pre-registers student
        bulk_req = PreRegBulkCreateRequest(students=[
            PreRegStudentCreate(reg_no="REG-ALICE", full_name="Alice Lovelace", department="Computer Science", class_id=1)
        ])
        pre_res = bulk_pre_register_students(bulk_req, db=self.db, current=self.staff1_ctx)
        self.assertIn("Successfully pre-registered 1 students", pre_res["message"])

        # Verify pre-registered list
        pre_list = get_pre_registered_students(db=self.db, current=self.staff1_ctx)
        self.assertEqual(len(pre_list), 1)
        self.assertEqual(pre_list[0].reg_no, "REG-ALICE")

        # Now student registers successfully
        reg_res = register_student(stu_req, db=self.db)
        self.assertIn("Student registered successfully", reg_res["message"])

        # Email availability now shows registered as Student
        avail_after = check_email_availability("alice@biew.edu.in", db=self.db)
        self.assertTrue(avail_after["exists"])
        self.assertEqual(avail_after["registered_role"], "Student")

        # Duplicate student registration should fail
        with self.assertRaises(HTTPException) as cm:
            register_student(stu_req, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)

        # Cross-role registration: Attempt to register Staff with same email -> fails
        with self.assertRaises(HTTPException) as cm:
            register_staff(StaffRegisterRequest(full_name="Fake Staff", email="alice@biew.edu.in", password="P@1", role_type="both"), db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Student", cm.exception.detail)

        # Login Tests
        # Correct login
        tok = login(LoginRequest(email="alice@biew.edu.in", password="Password@123", user_type="student"), db=self.db)
        self.assertEqual(tok.user_type, "student")
        self.assertEqual(tok.full_name, "Alice Lovelace")
        self.assertTrue(bool(tok.access_token))

        # Case-insensitive login
        tok_upper = login(LoginRequest(email="ALICE@BIEW.EDU.IN", password="Password@123", user_type="student"), db=self.db)
        self.assertEqual(tok_upper.user_type, "student")

        # Wrong password -> 401
        with self.assertRaises(HTTPException) as cm:
            login(LoginRequest(email="alice@biew.edu.in", password="WrongPassword!", user_type="student"), db=self.db)
        self.assertEqual(cm.exception.status_code, 401)

        # Cross-role login: Student logging in under Staff tab -> 400 with helpful redirection notice
        with self.assertRaises(HTTPException) as cm:
            login(LoginRequest(email="alice@biew.edu.in", password="Password@123", user_type="staff"), db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("Student login tab", cm.exception.detail)

    # ─────────────────────────────────────────────────────────────
    # 3. ATTENDANCE SYSTEM (Marking, Overwriting, Filtering, Alerts)
    # ─────────────────────────────────────────────────────────────
    def test_attendance_complete_lifecycle(self):
        # Setup class, subjects, and student
        cg = ClassGroup(id=1, name="III CSE - A", department="Computer Science")
        sub = Subject(id=1, name="Algorithms", class_id=1)
        self.db.add_all([cg, sub])
        self.db.commit()

        stu = Student(
            id=1, full_name="Student Attendance Test", email="att_test@biew.edu.in",
            password_hash="hash", reg_no="REG-ATT", roll_no="01", class_id=1
        )
        self.db.add(stu)
        self.db.commit()

        stu_ctx = {"user": stu, "user_type": "student"}

        # 1. Mark Whole-day Attendance (subject_id = None)
        mark_res = mark_attendance(
            MarkAttendanceRequest(
                class_id=1, subject_id=None, date=date(2026, 3, 1),
                records=[AttendanceMarkItem(student_id=1, status="present")]
            ),
            db=self.db, current=self.staff1_ctx
        )
        self.assertIn("Attendance saved for 1 students", mark_res["message"])

        # 2. Mark Subject-specific Attendance (subject_id = 1)
        mark_attendance(
            MarkAttendanceRequest(
                class_id=1, subject_id=1, date=date(2026, 3, 2),
                records=[AttendanceMarkItem(student_id=1, status="absent")]
            ),
            db=self.db, current=self.staff1_ctx
        )

        # 3. Mark Leave on another month (February)
        mark_attendance(
            MarkAttendanceRequest(
                class_id=1, subject_id=None, date=date(2026, 2, 15),
                records=[AttendanceMarkItem(student_id=1, status="leave")]
            ),
            db=self.db, current=self.staff1_ctx
        )

        # 4. Overwrite check: change 2026-03-02 from absent to present
        mark_attendance(
            MarkAttendanceRequest(
                class_id=1, subject_id=1, date=date(2026, 3, 2),
                records=[AttendanceMarkItem(student_id=1, status="present")]
            ),
            db=self.db, current=self.staff1_ctx
        )

        # Verify records through /student/me
        my_all = get_my_attendance(month=None, year=None, db=self.db, current=stu_ctx)
        self.assertEqual(len(my_all), 3)
        # Verify sorted descending (latest first)
        self.assertEqual(my_all[0].date, date(2026, 3, 2))
        self.assertEqual(my_all[1].date, date(2026, 3, 1))
        self.assertEqual(my_all[2].date, date(2026, 2, 15))

        # Check subject_name resolution
        self.assertEqual(my_all[0].subject_name, "Algorithms")
        self.assertIsNone(my_all[1].subject_name)

        # Verify month filter alone
        my_mar = get_my_attendance(month=3, year=None, db=self.db, current=stu_ctx)
        self.assertEqual(len(my_mar), 2)

        my_feb = get_my_attendance(month=2, year=None, db=self.db, current=stu_ctx)
        self.assertEqual(len(my_feb), 1)

        # Verify summary math
        summary_all = get_my_attendance_summary(month=None, year=None, db=self.db, current=stu_ctx)
        # 3 records: 2 present, 0 absent (overwritten), 1 leave -> (2/3)*100 = 66.67%
        self.assertEqual(summary_all.total_marked, 3)
        self.assertEqual(summary_all.present, 2)
        self.assertEqual(summary_all.leave, 1)
        self.assertEqual(summary_all.absent, 0)
        self.assertEqual(summary_all.percentage, 66.67)

        # Low attendance check: 66.67% is < 75%
        low_students = get_class_low_attendance(class_id=1, threshold=75.0, db=self.db, current=self.staff1_ctx)
        self.assertEqual(len(low_students), 1)
        self.assertEqual(low_students[0]["student_id"], 1)
        self.assertEqual(low_students[0]["percentage"], 66.7)

        # Broadcast low attendance warning
        notif_res = notify_low_attendance(class_id=1, threshold=75.0, db=self.db, current=self.staff1_ctx)
        self.assertEqual(notif_res["status"], "success")
        self.assertEqual(notif_res["alerted_students"], 1)

        # Invalid status rejection
        with self.assertRaises(HTTPException) as cm:
            mark_attendance(
                MarkAttendanceRequest(class_id=1, subject_id=None, date=date(2026, 3, 3), records=[AttendanceMarkItem(student_id=1, status="invalid_status")]),
                db=self.db, current=self.staff1_ctx
            )
        self.assertEqual(cm.exception.status_code, 400)

    # ─────────────────────────────────────────────────────────────
    # 4. MARKS, REPORT CARDS & BULK UPLOAD (CSV & Excel)
    # ─────────────────────────────────────────────────────────────
    def test_marks_management_and_bulk_upload(self):
        cg = ClassGroup(id=1, name="III CSE - A", department="Computer Science")
        sub = Subject(id=1, name="Algorithms", class_id=1)
        self.db.add_all([cg, sub])
        self.db.commit()

        stu1 = Student(id=1, full_name="Student 1", email="s1@biew.edu.in", password_hash="h", reg_no="REG-01", roll_no="01", class_id=1)
        stu2 = Student(id=2, full_name="Student 2", email="s2@biew.edu.in", password_hash="h", reg_no="REG-02", roll_no="02", class_id=1)
        self.db.add_all([stu1, stu2])
        self.db.commit()

        stu1_ctx = {"user": stu1, "user_type": "student"}

        # 1. Add single marks
        mark1 = add_marks(
            AddMarksRequest(student_id=1, subject_id=1, assessment_type="CIA-1", marks_obtained=18.5, max_marks=20.0),
            db=self.db, current=self.staff1_ctx
        )
        self.assertEqual(mark1.marks_obtained, 18.5)

        # 2. Overwrite marks
        mark1_updated = add_marks(
            AddMarksRequest(student_id=1, subject_id=1, assessment_type="CIA-1", marks_obtained=19.0, max_marks=20.0),
            db=self.db, current=self.staff1_ctx
        )
        self.assertEqual(mark1_updated.marks_obtained, 19.0)

        # 3. Check student marks view
        stu_marks = get_student_marks(student_id=1, db=self.db, current=stu1_ctx)
        self.assertEqual(len(stu_marks), 1)

        # Security: Stu1 cannot view Stu2's marks
        with self.assertRaises(HTTPException) as cm:
            get_student_marks(student_id=2, db=self.db, current=stu1_ctx)
        self.assertEqual(cm.exception.status_code, 403)

        # 4. Class Marks Sheet
        sheet = get_class_marks_sheet(class_id=1, subject_id=1, db=self.db, current=self.staff1_ctx)
        self.assertIn("CIA-1", sheet.assessment_columns)
        self.assertEqual(len(sheet.rows), 2)

        # 5. Bulk Upload via CSV
        csv_data = (
            "Reg No,Student Name,CIA-2,Model Exam\n"
            "REG-01,Student 1,17,85\n"
            "REG-02,Student 2,15,78\n"
        ).encode("utf-8")

        upload_file_csv = UploadFile(
            filename="marks_template.csv",
            file=io.BytesIO(csv_data),
            headers=Headers({"content-type": "text/csv"})
        )

        bulk_res = bulk_upload_marks(
            subject_id=1, class_id=1, max_marks_per_assessment=100.0,
            file=upload_file_csv, db=self.db, current=self.staff1_ctx
        )
        self.assertEqual(bulk_res.saved, 2)
        self.assertEqual(len(bulk_res.errors), 0)

        # Verify that marks were inserted for both students
        marks_stu2 = get_student_marks(student_id=2, db=self.db, current=self.staff1_ctx)
        self.assertEqual(len(marks_stu2), 2)  # CIA-2 and Model Exam

        # 6. Bulk Upload Error Handling (Missing Reg No column)
        bad_csv = "Name,CIA-1\nAlice,20\n".encode("utf-8")
        upload_bad = UploadFile(filename="bad.csv", file=io.BytesIO(bad_csv))
        with self.assertRaises(HTTPException) as cm:
            bulk_upload_marks(subject_id=1, class_id=1, max_marks_per_assessment=20.0, file=upload_bad, db=self.db, current=self.staff1_ctx)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("Missing columns", cm.exception.detail)

    # ─────────────────────────────────────────────────────────────
    # 5. STUDY MATERIALS & QUESTION BANK
    # ─────────────────────────────────────────────────────────────
    def test_materials_and_question_bank(self):
        sub = Subject(id=1, name="Operating Systems", class_id=1)
        self.db.add(sub)
        self.db.commit()

        # Upload Note
        sample_pdf = io.BytesIO(b"%PDF-1.4 dummy pdf content for notes testing")
        upload_pdf = UploadFile(filename="unit1_os.pdf", file=sample_pdf)
        note = upload_note(subject_id=1, title="Unit 1 OS Architecture", file=upload_pdf, db=self.db, current=self.staff1_ctx)
        self.assertEqual(note.title, "Unit 1 OS Architecture")

        # List notes
        notes = list_notes(subject_id=1, db=self.db, current=self.staff1_ctx)
        self.assertEqual(len(notes), 1)

        # Upload Question Bank
        sample_doc = io.BytesIO(b"%PDF-1.4 Question Bank PDF content")
        upload_doc = UploadFile(filename="os_qb.pdf", file=sample_doc)
        qb_item = upload_question_bank_item(subject_id=1, title="2-Mark & 16-Mark Questions", file=upload_doc, db=self.db, current=self.staff1_ctx)
        self.assertEqual(qb_item.title, "2-Mark & 16-Mark Questions")

        # List Question Bank
        qb_list = list_question_bank(subject_id=1, db=self.db, current=self.staff1_ctx)
        self.assertEqual(len(qb_list), 1)

        # Invalid file format (e.g. .exe)
        bad_file = UploadFile(filename="malicious.exe", file=io.BytesIO(b"bad code"))
        with self.assertRaises(HTTPException) as cm:
            upload_note(subject_id=1, title="Malicious", file=bad_file, db=self.db, current=self.staff1_ctx)
        self.assertEqual(cm.exception.status_code, 400)

    # ─────────────────────────────────────────────────────────────
    # 6. NOTIFICATIONS & TARGET ISOLATION
    # ─────────────────────────────────────────────────────────────
    def test_notification_targeting_and_isolation(self):
        cg1 = ClassGroup(id=1, name="Class 1", department="CS")
        cg2 = ClassGroup(id=2, name="Class 2", department="IT")
        sub1 = Subject(id=1, name="CS Subject", class_id=1)
        sub2 = Subject(id=2, name="IT Subject", class_id=2)
        self.db.add_all([cg1, cg2, sub1, sub2])
        self.db.commit()

        stu1 = Student(id=1, full_name="Student CS", email="cs@biew.edu.in", password_hash="h", reg_no="CS01", roll_no="01", class_id=1)
        stu2 = Student(id=2, full_name="Student IT", email="it@biew.edu.in", password_hash="h", reg_no="IT01", roll_no="01", class_id=2)
        self.db.add_all([stu1, stu2])
        self.db.commit()

        stu1_ctx = {"user": stu1, "user_type": "student"}
        stu2_ctx = {"user": stu2, "user_type": "student"}

        # 1. Global notification
        send_announcement(
            AnnouncementCreateRequest(title="College Holiday", body="Tomorrow is a holiday.", target_type="all"),
            db=self.db, current=self.admin_ctx
        )

        # 2. Class 1 notification
        send_announcement(
            AnnouncementCreateRequest(title="Class 1 Test", body="Special test for Class 1.", target_type="class", target_id=1),
            db=self.db, current=self.staff1_ctx
        )

        # 3. Class 2 notification
        send_announcement(
            AnnouncementCreateRequest(title="Class 2 Workshop", body="Workshop for Class 2.", target_type="class", target_id=2),
            db=self.db, current=self.staff1_ctx
        )

        # Verify Student 1 notices (should get Holiday and Class 1 Test, but NOT Class 2 Workshop)
        notices_stu1 = get_my_notifications(db=self.db, current=stu1_ctx)
        self.assertEqual(len(notices_stu1), 2)
        titles_stu1 = [n.title for n in notices_stu1]
        self.assertIn("College Holiday", titles_stu1)
        self.assertIn("Class 1 Test", titles_stu1)
        self.assertNotIn("Class 2 Workshop", titles_stu1)

        # Verify Student 2 notices
        notices_stu2 = get_my_notifications(db=self.db, current=stu2_ctx)
        self.assertEqual(len(notices_stu2), 2)
        titles_stu2 = [n.title for n in notices_stu2]
        self.assertIn("College Holiday", titles_stu2)
        self.assertIn("Class 2 Workshop", titles_stu2)

    # ─────────────────────────────────────────────────────────────
    # 7. PROFILE & DASHBOARD INTEGRATION
    # ─────────────────────────────────────────────────────────────
    def test_student_dashboard_and_profile_picture(self):
        cg = ClassGroup(id=1, name="III CSE - A", department="Computer Science")
        sub = Subject(id=1, name="Maths", class_id=1)
        self.db.add_all([cg, sub])
        self.db.commit()

        stu = Student(id=1, full_name="Dashboard Student", email="dash@biew.edu.in", password_hash="h", reg_no="DASH01", roll_no="01", class_id=1)
        self.db.add(stu)
        self.db.commit()

        stu_ctx = {"user": stu, "user_type": "student"}

        # 1. Profile Picture Upload (Testing the fix for current_user_info user extraction)
        img_bytes = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF dummy jpeg content")
        upload_img = UploadFile(filename="profile.jpg", file=img_bytes)

        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        pic_res = loop.run_until_complete(
            upload_profile_picture(file=upload_img, db=self.db, current_user_info=stu_ctx)
        )
        self.assertIn("Profile picture updated successfully", pic_res["message"])

        # Check that user record in DB reflects profile_picture_url
        user_db = self.db.query(Student).filter(Student.id == 1).first()
        self.assertTrue(user_db.profile_picture_url.startswith("/uploads/profiles/student_1_"))

        # 2. Student Dashboard
        dash = get_student_dashboard(db=self.db, current=stu_ctx)
        self.assertEqual(dash.full_name, "Dashboard Student")
        self.assertEqual(dash.class_name, "III CSE - A")
        self.assertEqual(dash.subject_count, 1)

    # ─────────────────────────────────────────────────────────────
    # 8. ADMIN DASHBOARD & COLLEGE OVERVIEW
    # ─────────────────────────────────────────────────────────────
    def test_admin_college_overview(self):
        # Seed 1 class, 1 subject, 1 student
        cg = ClassGroup(id=1, name="I MCA", department="Computer Applications")
        sub = Subject(id=1, name="Python", class_id=1)
        stu = Student(id=1, full_name="Admin Test Student", email="ad_stu@biew.edu.in", password_hash="h", reg_no="MCA01", roll_no="01", class_id=1)
        self.db.add_all([cg, sub, stu])
        self.db.commit()

        # College overview counts
        overview = get_college_overview(db=self.db, current=self.admin_ctx)
        self.assertEqual(overview.total_students, 1)
        self.assertEqual(overview.total_staff, 2)  # staff1 and staff2
        self.assertEqual(overview.total_classes, 1)
        self.assertEqual(overview.total_subjects, 1)

        # List staff
        staff_list = list_all_staff(db=self.db, current=self.admin_ctx)
        self.assertEqual(len(staff_list), 2)

        # List students with class filter
        all_students = list_all_students(class_id=1, db=self.db, current=self.admin_ctx)
        self.assertEqual(len(all_students), 1)
        self.assertEqual(all_students[0].class_id, 1)

        # Empty class filter
        empty_students = list_all_students(class_id=999, db=self.db, current=self.admin_ctx)
        self.assertEqual(len(empty_students), 0)

        # Class overview
        class_ov = list_all_classes_overview(db=self.db, current=self.admin_ctx)
        self.assertEqual(len(class_ov), 1)
        self.assertEqual(class_ov[0].student_count, 1)


if __name__ == "__main__":
    unittest.main()
