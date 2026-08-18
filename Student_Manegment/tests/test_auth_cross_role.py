import sys
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.database import Base
from app.models.academic import ClassGroup
from app.models.student import Student
from app.models.staff import Staff, StaffRole
from app.models.admin import Admin
from app.schemas.auth import (
    StudentRegisterRequest,
    StaffRegisterRequest,
    AdminRegisterRequest,
    LoginRequest,
)
from app.routers.auth import (
    register_student,
    register_staff,
    register_admin,
    login,
    get_existing_role_for_email,
    check_email_exists,
)


class TestCrossRoleEmailUniqueness(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Clean tables
        self.db.query(Student).delete()
        self.db.query(Staff).delete()
        self.db.query(Admin).delete()
        self.db.query(ClassGroup).delete()
        self.db.commit()

        # Seed sample class
        cg = ClassGroup(id=1, name="III BCA - A", department="Computer Applications")
        self.db.add(cg)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_student_registered_blocks_staff_and_admin(self):
        # 1. Register Student
        student_payload = StudentRegisterRequest(
            full_name="Student One",
            reg_no="REG001",
            roll_no="21BCA01",
            class_id=1,
            email="shared@domain.com",
            password="Password@123",
        )
        res = register_student(student_payload, db=self.db)
        self.assertEqual(res["message"], "Student registered successfully")

        # Verify role lookup
        self.assertEqual(get_existing_role_for_email("shared@domain.com", self.db), "Student")
        self.assertEqual(get_existing_role_for_email("SHARED@DOMAIN.COM", self.db), "Student")
        self.assertTrue(check_email_exists("shared@domain.com", self.db))

        # 2. Try registering Staff with same email (exact case) -> Should fail
        staff_payload = StaffRegisterRequest(
            full_name="Staff One",
            email="shared@domain.com",
            password="Password@123",
            role_type="advisor",
        )
        with self.assertRaises(HTTPException) as cm:
            register_staff(staff_payload, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Student", cm.exception.detail)
        self.assertIn("cannot be registered as Staff", cm.exception.detail)

        # 3. Try registering Admin with same email (uppercase / mixed case) -> Should fail
        admin_payload = AdminRegisterRequest(
            full_name="Admin One",
            email="SHARED@DOMAIN.COM",
            password="Password@123",
        )
        with self.assertRaises(HTTPException) as cm:
            register_admin(admin_payload, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Student", cm.exception.detail)
        self.assertIn("cannot be registered as Admin", cm.exception.detail)

        # 4. Try registering Student again with same email -> Should fail
        student_payload_duplicate = StudentRegisterRequest(
            full_name="Student Two",
            reg_no="REG002",
            roll_no="21BCA02",
            class_id=1,
            email="shared@domain.com",
            password="Password@123",
        )
        with self.assertRaises(HTTPException) as cm:
            register_student(student_payload_duplicate, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Student", cm.exception.detail)

    def test_staff_registered_blocks_student_and_admin(self):
        # 1. Register Staff
        staff_payload = StaffRegisterRequest(
            full_name="Faculty Member",
            email="faculty@biew.edu.in",
            password="Password@123",
            role_type="both",
        )
        res = register_staff(staff_payload, db=self.db)
        self.assertEqual(res["message"], "Staff registered successfully")

        # 2. Try registering Student with faculty email -> Should fail
        student_payload = StudentRegisterRequest(
            full_name="Fake Student",
            reg_no="REG999",
            roll_no="21BCA99",
            class_id=1,
            email="FACULTY@BIEW.EDU.IN",
            password="Password@123",
        )
        with self.assertRaises(HTTPException) as cm:
            register_student(student_payload, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Staff", cm.exception.detail)
        self.assertIn("cannot be registered as Student", cm.exception.detail)

        # 3. Try registering Admin with faculty email -> Should fail
        admin_payload = AdminRegisterRequest(
            full_name="Faculty Trying Admin",
            email="faculty@biew.edu.in",
            password="Password@123",
        )
        with self.assertRaises(HTTPException) as cm:
            register_admin(admin_payload, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Staff", cm.exception.detail)
        self.assertIn("cannot be registered as Admin", cm.exception.detail)

    def test_admin_registered_blocks_student_and_staff(self):
        # 1. Register Admin
        admin_payload = AdminRegisterRequest(
            full_name="Principal User",
            email="principal@biew.edu.in",
            password="Password@123",
            designation="Principal",
        )
        res = register_admin(admin_payload, db=self.db)
        self.assertEqual(res["message"], "Admin registered successfully")

        # 2. Try registering Student with principal email -> Should fail
        student_payload = StudentRegisterRequest(
            full_name="Student With Admin Email",
            reg_no="REG888",
            roll_no="21BCA88",
            class_id=1,
            email="principal@biew.edu.in",
            password="Password@123",
        )
        with self.assertRaises(HTTPException) as cm:
            register_student(student_payload, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Admin", cm.exception.detail)
        self.assertIn("cannot be registered as Student", cm.exception.detail)

        # 3. Try registering Staff with principal email -> Should fail
        staff_payload = StaffRegisterRequest(
            full_name="Staff With Admin Email",
            email="principal@biew.edu.in",
            password="Password@123",
            role_type="advisor",
        )
        with self.assertRaises(HTTPException) as cm:
            register_staff(staff_payload, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already registered as a Admin", cm.exception.detail)
        self.assertIn("cannot be registered as Staff", cm.exception.detail)

    def test_login_cross_role_helpful_messages(self):
        # Register student
        student_payload = StudentRegisterRequest(
            full_name="Student John",
            reg_no="REG123",
            roll_no="21BCA12",
            class_id=1,
            email="john@college.edu",
            password="SecurePassword@123",
        )
        register_student(student_payload, db=self.db)

        # Login successfully as student
        login_res = login(
            LoginRequest(email="john@college.edu", password="SecurePassword@123", user_type="student"),
            db=self.db,
        )
        self.assertEqual(login_res.user_type, "student")
        self.assertEqual(login_res.full_name, "Student John")

        # Case-insensitive login as student
        login_res_upper = login(
            LoginRequest(email="JOHN@COLLEGE.EDU", password="SecurePassword@123", user_type="student"),
            db=self.db,
        )
        self.assertEqual(login_res_upper.user_type, "student")

        # Student tries to log in under Staff tab -> Informative message returned
        with self.assertRaises(HTTPException) as cm:
            login(
                LoginRequest(email="john@college.edu", password="SecurePassword@123", user_type="staff"),
                db=self.db,
            )
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("registered as a Student", cm.exception.detail)
        self.assertIn("Student login tab", cm.exception.detail)


if __name__ == "__main__":
    unittest.main()
