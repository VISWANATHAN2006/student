# BIEW Connect Backend

This project is the FastAPI backend for the BIEW Connect student application.

## Features

- User authentication
- Student and staff management
- Academic records
- Attendance tracking
- Marks management
- Excel import support
- MySQL database integration

## Project Structure

```text
biew-connect-backend/
  app/
    core/
    models/
    routers/
    schemas/
    services/
  requirements.txt
```

## Prerequisites

- Python 3.10+
- MySQL database
- Virtual environment (recommended)

## Setup

1. Open the project folder
2. Create a virtual environment:

```bash
python -m venv .venv
```

3. Activate the environment:

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On Linux/macOS:

```bash
source .venv/bin/activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Configure your environment variables in `.env` if needed.

## Run the app

```bash
uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000
```

## API docs

FastAPI automatically provides Swagger UI and ReDoc:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Notes

- The app creates database tables automatically on startup.
- Update the MySQL connection settings in the application config if needed.

## License

This project is for educational and internal use.
