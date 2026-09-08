import unittest
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.exceptions import HTTPException

from app.database import Base
from app.core.security import hash_password, verify_password
from app.models.student import Student, PreRegisteredStudent
from app.models.staff import Staff, StaffRole
from app.models.admin import Admin
from app.models.academic import Department, ClassGroup
from app.models.password_reset import PasswordResetOtp

from app.schemas.auth import (
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    LoginRequest,
)
from app.routers.auth import (
    forgot_password,
    verify_reset_otp,
    reset_password,
    login,
)


class TestForgotPasswordSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        self.db.query(PasswordResetOtp).delete()
        self.db.query(Student).delete()
        self.db.query(Staff).delete()
        self.db.query(Admin).delete()
        self.db.query(ClassGroup).delete()
        self.db.query(Department).delete()
        self.db.commit()

        # Seed Class and Department
        dept = Department(id=1, name="Computer Science")
        cls_grp = ClassGroup(id=1, name="CSE-3A", department="Computer Science")
        self.db.add_all([dept, cls_grp])
        self.db.commit()

        # Seed Student
        self.student = Student(
            id=1,
            full_name="Alice Student",
            reg_no="REG-STU01",
            roll_no="R01",
            class_id=1,
            email="alice@biew.edu.in",
            password_hash=hash_password("OldStudentPassword@123"),
        )

        # Seed Staff
        self.staff = Staff(
            id=1,
            full_name="Bob Staff",
            email="bob@biew.edu.in",
            role_type=StaffRole.both,
            password_hash=hash_password("OldStaffPassword@123"),
        )

        # Seed Admin
        self.admin = Admin(
            id=1,
            full_name="Carol Admin",
            email="carol@biew.edu.in",
            designation="Principal",
            password_hash=hash_password("OldAdminPassword@123"),
        )

        self.db.add_all([self.student, self.staff, self.admin])
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_forgot_password_unknown_email_fails(self):
        req = ForgotPasswordRequest(email="unknown@biew.edu.in")
        with self.assertRaises(HTTPException) as cm:
            forgot_password(req, db=self.db)
        self.assertEqual(cm.exception.status_code, 404)
        self.assertIn("No account found", cm.exception.detail)

    def test_forgot_password_role_mismatch_fails(self):
        # Alice is a student, not staff
        req = ForgotPasswordRequest(email="alice@biew.edu.in", user_type="staff")
        with self.assertRaises(HTTPException) as cm:
            forgot_password(req, db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("belongs to a Student account", cm.exception.detail)

    def test_student_forgot_and_reset_password_lifecycle(self):
        # 1. Request OTP
        req = ForgotPasswordRequest(email="alice@biew.edu.in")
        res = forgot_password(req, db=self.db)
        self.assertEqual(res.email, "alice@biew.edu.in")
        self.assertEqual(res.user_type, "student")
        self.assertIsNotNone(res.otp_preview)
        otp = res.otp_preview
        self.assertEqual(len(otp), 6)

        # 2. Verify OTP with wrong code
        with self.assertRaises(HTTPException) as cm:
            verify_reset_otp(VerifyOtpRequest(email="alice@biew.edu.in", otp="000000"), db=self.db)
        self.assertEqual(cm.exception.status_code, 400)

        # 3. Verify OTP with correct code
        v_res = verify_reset_otp(VerifyOtpRequest(email="alice@biew.edu.in", otp=otp), db=self.db)
        self.assertEqual(v_res.message, "Reset code is valid.")

        # 4. Attempt reset with too short password
        with self.assertRaises(HTTPException) as cm:
            reset_password(ResetPasswordRequest(email="alice@biew.edu.in", otp=otp, new_password="123"), db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("at least 6 characters", cm.exception.detail)

        # 5. Successfully reset password
        r_res = reset_password(
            ResetPasswordRequest(email="alice@biew.edu.in", otp=otp, new_password="NewStudentPassword@2026"),
            db=self.db,
        )
        self.assertIn("Password reset successfully", r_res.message)

        # 6. Replay attack prevention: OTP cannot be reused
        with self.assertRaises(HTTPException) as cm:
            reset_password(
                ResetPasswordRequest(email="alice@biew.edu.in", otp=otp, new_password="AnotherPassword@2026"),
                db=self.db,
            )
        self.assertEqual(cm.exception.status_code, 400)

        # 7. Old password no longer works
        with self.assertRaises(HTTPException) as cm:
            login(LoginRequest(email="alice@biew.edu.in", password="OldStudentPassword@123", user_type="student"), db=self.db)
        self.assertEqual(cm.exception.status_code, 401)

        # 8. New password logs in successfully
        login_res = login(
            LoginRequest(email="alice@biew.edu.in", password="NewStudentPassword@2026", user_type="student"),
            db=self.db,
        )
        self.assertEqual(login_res.user_type, "student")
        self.assertIsNotNone(login_res.access_token)

    def test_staff_and_admin_password_reset(self):
        # Staff Reset
        staff_res = forgot_password(ForgotPasswordRequest(email="bob@biew.edu.in"), db=self.db)
        staff_otp = staff_res.otp_preview
        reset_password(
            ResetPasswordRequest(email="bob@biew.edu.in", otp=staff_otp, new_password="NewStaffSecret@789"),
            db=self.db,
        )
        staff_login = login(
            LoginRequest(email="bob@biew.edu.in", password="NewStaffSecret@789", user_type="staff"),
            db=self.db,
        )
        self.assertEqual(staff_login.user_type, "staff")

        # Admin Reset
        admin_res = forgot_password(ForgotPasswordRequest(email="carol@biew.edu.in"), db=self.db)
        admin_otp = admin_res.otp_preview
        reset_password(
            ResetPasswordRequest(email="carol@biew.edu.in", otp=admin_otp, new_password="NewAdminSecret@999"),
            db=self.db,
        )
        admin_login = login(
            LoginRequest(email="carol@biew.edu.in", password="NewAdminSecret@999", user_type="admin"),
            db=self.db,
        )
        self.assertEqual(admin_login.user_type, "admin")

    def test_expired_otp_rejection(self):
        res = forgot_password(ForgotPasswordRequest(email="alice@biew.edu.in"), db=self.db)
        otp = res.otp_preview

        # Artificially expire the OTP in DB
        otp_row = self.db.query(PasswordResetOtp).filter(PasswordResetOtp.otp_code == otp).first()
        otp_row.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        self.db.commit()

        # Verify should reject
        with self.assertRaises(HTTPException) as cm:
            verify_reset_otp(VerifyOtpRequest(email="alice@biew.edu.in", otp=otp), db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("expired", cm.exception.detail)

        # Reset should reject
        with self.assertRaises(HTTPException) as cm:
            reset_password(ResetPasswordRequest(email="alice@biew.edu.in", otp=otp, new_password="Pass@123456"), db=self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("expired", cm.exception.detail)


if __name__ == "__main__":
    unittest.main()
