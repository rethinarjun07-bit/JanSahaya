@echo off
cd /d "%~dp0"
echo ==========================================================
echo   Starting JanSahaya Full Stack (Python + React + PG)
echo ==========================================================

echo [*] Starting Python FastAPI Backend in new window...
start "JanSahaya FastAPI Backend" cmd /k "call start_backend.bat"

echo [*] Starting React (Next.js) Frontend in current window...
npm run dev
