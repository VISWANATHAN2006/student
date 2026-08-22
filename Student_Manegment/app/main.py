from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import Base, engine

from app.models import academic, student, staff, academic_records, files, notification, admin  # noqa: F401

app = FastAPI(title="Student Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "BIEW Connect API is running"}

@app.get("/test404")
def test404():
    return {"message": "Test successful!"}


from app.routers import auth  # noqa: E402
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

from app.routers import profile  # noqa: E402
app.include_router(profile.router, prefix="/profile", tags=["Profile"])

from app.routers import academic  # noqa: E402
app.include_router(academic.router, tags=["Classes & Subjects"])

from app.routers import attendance  # noqa: E402
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])

from app.routers import marks  # noqa: E402
app.include_router(marks.router, prefix="/marks", tags=["Marks"])

from app.routers import notes  # noqa: E402
app.include_router(notes.router, prefix="/notes", tags=["Notes"])

from app.routers import question_bank  # noqa: E402
app.include_router(question_bank.router, prefix="/question-bank", tags=["Question Bank"])

from app.routers import notifications  # noqa: E402
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

from app.routers import students  # noqa: E402
app.include_router(students.router, prefix="/students", tags=["Student Dashboard"])

from app.routers import staff as staff_router  # noqa: E402
app.include_router(staff_router.router, prefix="/staff", tags=["Staff Dashboard"])

from app.routers import admin  # noqa: E402
app.include_router(admin.router, prefix="/admin", tags=["Admin (Principal)"])
# Trigger reload
