import os
import uuid
from fastapi import UploadFile

# Files are saved here and served back out from the same folder via a static mount in main.py.
# Swap this out for cloud storage (S3/Cloudinary) later without touching the routers —
# only this function needs to change.
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_uploaded_file(file: UploadFile) -> tuple[str, int]:
    """Saves the file to disk with a unique name. Returns (public_url_path, size_in_kb)."""
    if not file.filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are allowed")

    unique_name = f"{uuid.uuid4().hex}.pdf"
    disk_path = os.path.join(UPLOAD_DIR, unique_name)

    contents = file.file.read()
    with open(disk_path, "wb") as f:
        f.write(contents)

    size_kb = len(contents) // 1024
    public_url = f"/uploads/{unique_name}"
    return public_url, size_kb
