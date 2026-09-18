import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

import app.models
from app.database import Base
from app.models.academic import Department, ClassGroup, Subject
from app.models.student import Student
from app.models.staff import Staff, StaffSubjectAssignment
from app.models.admin import Admin
from app.models.academic_records import Marks
from app.core.security import hash_password

from app.routers.academic import create_department, create_class, list_classes, create_subject
from app.routers.staff import (
    assign_subject,
    get_staff_assigned_subjects,
    get_my_assigned_subjects,
    unassign_subject,
    bulk_pre_register_students,
    get_pre_registered_students,
    AssignSubjectRequest,
)
from app.routers.marks import bulk_save_marks, get_my_marks, BulkSaveMarksRequest, BatchMarkItem
from app.schemas.academic import DepartmentCreateRequest, ClassCreateRequest, SubjectCreateRequest
from app.schemas.prereg import PreRegBulkCreateRequest, PreRegStudentCreate

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_portal_enhancements.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class TestPortalEnhancements(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def setUp(self):
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_department_wise_class_ab_uniqueness(self):
        """Verify that CS and Mechanical can BOTH have Class A and Class B without collision."""
        admin = Admin(full_name="Admin", email="admin1@biew.edu.in", password_hash=hash_password("pw"))
        self.db.add(admin)
        self.db.commit()
        admin_dep = {"user_type": "admin", "user": admin}

        # Create CS and Mech departments
        create_department(DepartmentCreateRequest(name="Computer Science"), db=self.db, current=admin_dep)
        create_department(DepartmentCreateRequest(name="Mechanical"), db=self.db, current=admin_dep)

        # 1. Create Class A in CS
        cs_a = create_class(
            ClassCreateRequest(name="Class A", department="Computer Science"),
            db=self.db,
            current=admin_dep,
        )
        self.assertEqual(cs_a.name, "Class A")
        self.assertEqual(cs_a.department, "Computer Science")

        # 2. Create Class B in CS
        cs_b = create_class(
            ClassCreateRequest(name="Class B", department="Computer Science"),
            db=self.db,
            current=admin_dep,
        )
        self.assertEqual(cs_b.name, "Class B")

        # 3. Create Class A in Mechanical (Must succeed despite same name)
        mech_a = create_class(
            ClassCreateRequest(name="Class A", department="Mechanical"),
            db=self.db,
            current=admin_dep,
        )
        self.assertEqual(mech_a.name, "Class A")
        self.assertEqual(mech_a.department, "Mechanical")

        # 4. Create Class B in Mechanical (Must succeed despite same name)
        mech_b = create_class(
            ClassCreateRequest(name="Class B", department="Mechanical"),
            db=self.db,
            current=admin_dep,
        )
        self.assertEqual(mech_b.name, "Class B")

        # 5. Duplicate Class A in Computer Science must raise 400
        with self.assertRaises(HTTPException) as cm:
            create_class(
                ClassCreateRequest(name="Class A", department="Computer Science"),
                db=self.db,
                current=admin_dep,
            )
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("already exists in department", cm.exception.detail)

        # 6. Verify list_classes with department filter
        mech_classes = list_classes(department="Mechanical", db=self.db)
        self.assertEqual(len(mech_classes), 2)
        for c in mech_classes:
            self.assertEqual(c.department, "Mechanical")

    def test_02_staff_assigned_subjects_lifecycle(self):
        """Verify subject assignment to staff, self-retrieval, and unassignment."""
        admin = Admin(full_name="Admin2", email="admin2@biew.edu.in", password_hash=hash_password("pw"))
        staff = Staff(
            full_name="Prof. Sharma",
            email="sharma@biew.edu.in",
            password_hash=hash_password("pw"),
            role_type="both",
            department="Computer Science",
        )
        self.db.add(admin)
        self.db.add(staff)
        self.db.commit()

        admin_dep = {"user_type": "admin", "user": admin}
        staff_dep = {"user_type": "staff", "user": staff}

        # Create Subject
        sub = create_subject(
            SubjectCreateRequest(name="Python Programming", class_id=1),
            db=self.db,
            current=admin_dep,
        )

        # Staff gets assigned subjects before assignment
        empty_subs = get_my_assigned_subjects(db=self.db, current=staff_dep)
        self.assertEqual(len(empty_subs), 0)

        # Admin assigns subject to staff
        assigned = assign_subject(
            AssignSubjectRequest(staff_id=staff.id, subject_id=sub.id, class_id=1),
            db=self.db,
            current=admin_dep,
        )
        self.assertIn("assigned", assigned["message"].lower())

        # Staff retrieves their assigned subjects
        staff_subs = get_my_assigned_subjects(db=self.db, current=staff_dep)
        self.assertEqual(len(staff_subs), 1)
        self.assertEqual(staff_subs[0].subject_name, "Python Programming")

        # Admin queries staff's assigned subjects
        admin_view = get_staff_assigned_subjects(staff_id=staff.id, db=self.db, current=admin_dep)
        self.assertEqual(len(admin_view), 1)
        assignment_id = admin_view[0].id

        # Admin unassigns subject
        res = unassign_subject(assignment_id=assignment_id, db=self.db, current=admin_dep)
        self.assertIn("unassigned successfully", res["message"])

        # Staff assigned subjects is empty again
        after_unassign = get_my_assigned_subjects(db=self.db, current=staff_dep)
        self.assertEqual(len(after_unassign), 0)

    def test_03_in_page_bulk_marks_save_and_individual_isolation(self):
        """Verify in-page bulk marks save and strict individual student marks isolation."""
        staff = Staff(
            full_name="Staff Marks",
            email="staffmarks@biew.edu.in",
            password_hash=hash_password("pw"),
            role_type="both",
        )
        st1 = Student(
            full_name="Kavitha M",
            reg_no="23BCA01",
            roll_no="01",
            email="kavitha@biew.edu.in",
            password_hash=hash_password("pw"),
            class_id=1,
            department="Computer Science",
        )
        st2 = Student(
            full_name="Manoj K",
            reg_no="23BCA02",
            roll_no="02",
            email="manoj@biew.edu.in",
            password_hash=hash_password("pw"),
            class_id=1,
            department="Computer Science",
        )
        sub = Subject(name="Web Technology", class_id=1)
        self.db.add_all([staff, st1, st2, sub])
        self.db.commit()

        staff_dep = {"user_type": "staff", "user": staff}
        st1_dep = {"user_type": "student", "user": st1}
        st2_dep = {"user_type": "student", "user": st2}

        # Staff performs in-page bulk save for entire class
        payload = BulkSaveMarksRequest(
            subject_id=sub.id,
            class_id=1,
            assessment_type="CIA-1",
            max_marks=20.0,
            entries=[
                BatchMarkItem(student_id=st1.id, marks_obtained=18.5),
                BatchMarkItem(student_id=st2.id, marks_obtained=19.5),
            ],
        )
        bulk_res = bulk_save_marks(payload=payload, db=self.db, current=staff_dep)
        self.assertIn("Bulk marks saved successfully", bulk_res["message"])

        # Student 1 gets strictly their own marks via get_my_marks
        kavitha_marks = get_my_marks(db=self.db, current=st1_dep)
        self.assertEqual(len(kavitha_marks), 1)
        self.assertEqual(kavitha_marks[0].marks_obtained, 18.5)
        self.assertEqual(kavitha_marks[0].student_id, st1.id)

        # Student 2 gets strictly their own marks via get_my_marks
        manoj_marks = get_my_marks(db=self.db, current=st2_dep)
        self.assertEqual(len(manoj_marks), 1)
        self.assertEqual(manoj_marks[0].marks_obtained, 19.5)
        self.assertEqual(manoj_marks[0].student_id, st2.id)

    def test_04_staff_pre_registration_bulk_and_filtering(self):
        """Verify staff pre-registration bulk addition and class/department filtering."""
        staff = Staff(
            full_name="Staff PreReg",
            email="staffprereg@biew.edu.in",
            password_hash=hash_password("pw"),
            role_type="both",
        )
        self.db.add(staff)
        self.db.commit()
        staff_dep = {"user_type": "staff", "user": staff}

        # Bulk add 2 students
        items = PreRegBulkCreateRequest(
            students=[
                PreRegStudentCreate(reg_no="23CS101", full_name="Student One", department="Computer Science", class_id=1),
                PreRegStudentCreate(reg_no="23ME101", full_name="Student Two", department="Mechanical", class_id=2),
            ]
        )
        res = bulk_pre_register_students(items, db=self.db, current=staff_dep)
        self.assertIn("pre-registered", res["message"].lower())

        # Query filtered by department
        cs_students = get_pre_registered_students(department="Computer Science", db=self.db, current=staff_dep)
        self.assertTrue(any(s.reg_no == "23CS101" for s in cs_students))
        self.assertFalse(any(s.reg_no == "23ME101" for s in cs_students))

        # Query filtered by class_id
        mech_students = get_pre_registered_students(class_id=2, db=self.db, current=staff_dep)
        self.assertTrue(any(s.reg_no == "23ME101" for s in mech_students))
        self.assertFalse(any(s.reg_no == "23CS101" for s in mech_students))


if __name__ == "__main__":
    unittest.main()
