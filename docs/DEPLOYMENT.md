# Local Deployment & Troubleshooting Guide (Phase 1 POC)

Step-by-step guide for configuring, running, and verifying the Phase 1 backend application locally.

---

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu 20.04+
- **Python**: Version 3.11 or higher
- **PostgreSQL**: Version 14 or higher
- **Virtual Environment Tool**: Python standard `venv`

---

## 2. Environment Setup

1. Clone or extract the project repository into your local directory.
2. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
3. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 3. Database Configuration

1. Ensure PostgreSQL is running on `localhost:5432`.
2. Create a new database named `differentiated_offers`:
   ```sql
   CREATE DATABASE differentiated_offers;
   ```
3. Create a `.env` file inside `backend/`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/differentiated_offers
   OPENAI_API_KEY=your_openai_api_key_here
   LLM_PROVIDER=openai
   APP_ENV=development
   ```

---

## 4. Running the Application Server

Start the Uvicorn ASGI dev server:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once started:
- Access interactive API docs at: `http://127.0.0.1:8000/docs`
- Access OpenAPI JSON schema at: `http://127.0.0.1:8000/openapi.json`

---

## 5. Running Tests

Run the unified test runner:
```bash
python tests/run_all_tests.py
```

Or run individual test modules directly:
```bash
python -m unittest tests/test_agents.py
python -m unittest tests/test_database.py
python -m unittest tests/test_routes.py
```

---

## 6. Troubleshooting

### Issue: `RuntimeError: Mandatory configuration value DATABASE_URL is missing!`
- **Cause**: Environment variable `DATABASE_URL` is missing or `.env` file is in the wrong directory.
- **Solution**: Ensure `.env` exists in `backend/` directory and contains `DATABASE_URL=postgresql://...`.

### Issue: `psycopg.OperationalError: connection to server at "localhost" failed`
- **Cause**: PostgreSQL service is stopped or port `5432` is blocked.
- **Solution**: Verify PostgreSQL is running via `pg_isready` or system service manager.

### Issue: `ModuleNotFoundError: No module named 'app'`
- **Cause**: Python command executed outside `backend/` working directory.
- **Solution**: Always run `python` and `uvicorn` commands from inside `backend/`.
