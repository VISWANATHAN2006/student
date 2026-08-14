from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import all models so SQLAlchemy knows about every table before create_all() runs
from app.models import academic, student, staff, academic_records  # noqa: F401

app = FastAPI(title="BIEW Connect API", version="1.0.0")

# Allow the React Native app (and browser testing) to call this API.
# For a real production app, replace "*" with your actual app's origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Creates any tables that don't exist yet in MySQL. Safe to run every time —
    # it never touches tables/columns that already exist.
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "BIEW Connect API is running"}


from app.routers import auth  # noqa: E402
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

from app.routers import academic  # noqa: E402
app.include_router(academic.router, tags=["Classes & Subjects"])

from app.routers import attendance  # noqa: E402
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])

from app.routers import marks  # noqa: E402
app.include_router(marks.router, prefix="/marks", tags=["Marks"])
