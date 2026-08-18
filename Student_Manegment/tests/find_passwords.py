from app.database import SessionLocal
from app.models.student import Student
from app.models.staff import Staff
from app.models.admin import Admin
from app.core.security import verify_password

db = SessionLocal()
candidates = [
    '123456', 'password', '12345678', '123456789', '112233', '123', 'admin', 'admin123',
    'ragul', 'ragul123', 'ragavi', 'ragavi123', 'viswa', 'viswa123', 'ram', 'ram123',
    'Password@123', '1234', 'student', 'staff', 'bca', 'cs', '12345', 'ragavi@123', 'ragul@123'
]

print("=== STUDENTS ===")
for s in db.query(Student).all():
    matched = "Unknown"
    for p in candidates:
        try:
            if verify_password(p, s.password_hash):
                matched = p
                break
        except Exception as e:
            pass
    print(f"Role: Student | Email: {s.email} | Name: {s.full_name} | Password: {matched}")

print("\n=== STAFF ===")
for st in db.query(Staff).all():
    matched = "Unknown"
    for p in candidates:
        try:
            if verify_password(p, st.password_hash):
                matched = p
                break
        except Exception as e:
            pass
    print(f"Role: Staff | Email: {st.email} | Name: {st.full_name} | Password: {matched}")

print("\n=== ADMIN ===")
for a in db.query(Admin).all():
    matched = "Unknown"
    for p in candidates:
        try:
            if verify_password(p, a.password_hash):
                matched = p
                break
        except Exception as e:
            pass
    print(f"Role: Admin | Email: {a.email} | Name: {a.full_name} | Password: {matched}")

db.close()
