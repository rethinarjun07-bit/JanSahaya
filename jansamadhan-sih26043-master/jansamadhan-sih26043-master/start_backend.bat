@echo off
cd /d "%~dp0"
set "PYTHONPATH=%~dp0;%~dp0backend;%PYTHONPATH%"
echo =======================================================
echo   Starting JanSahaya Python (FastAPI) Backend Service
echo =======================================================

:: 1. Check if virtual environment already exists
if exist "%~dp0backend\venv\Scripts\python.exe" (
    goto :activate_and_run
)

:: 2. Find a working Python installation to create the venv
set PY_CMD=

:: Check py launcher
py -3.11 --version >nul 2>nul && set "PY_CMD=py -3.11"
if not defined PY_CMD py -3 --version >nul 2>nul && set "PY_CMD=py -3"

:: Check if standard python command works (verifying exit code, not just where.exe)
if not defined PY_CMD (
    python --version >nul 2>nul && set "PY_CMD=python"
)

:: Check common Windows installation paths
if not defined PY_CMD (
    if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
        set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    ) else if exist "C:\Program Files\Python311\python.exe" (
        set "PY_CMD=C:\Program Files\Python311\python.exe"
    ) else if exist "C:\Program Files\Python312\python.exe" (
        set "PY_CMD=C:\Program Files\Python312\python.exe"
    )
)

if not defined PY_CMD (
    echo [!] Python was not found in your PATH.
    echo [!] Please install Python 3.11+ or run via Docker:
    echo        docker compose up
    echo.
    pause
    exit /b 1
)

echo [*] Creating Python virtual environment in backend\venv using %PY_CMD%...
%PY_CMD% -m venv backend\venv
if %ERRORLEVEL% NEQ 0 (
    echo [!] Failed to create virtual environment.
    pause
    exit /b 1
)

:activate_and_run
:: Activate Virtual Environment
call "%~dp0backend\venv\Scripts\activate.bat"
set "PYTHONPATH=%~dp0;%~dp0backend;%PYTHONPATH%"

:: Install Requirements
echo [*] Installing / Checking Python dependencies...
python -m pip install -r backend\requirements.txt

:: Run FastAPI Uvicorn Server
echo [*] Launching FastAPI on http://localhost:8000 ...
echo [*] Interactive Swagger Docs available at http://localhost:8000/docs
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
