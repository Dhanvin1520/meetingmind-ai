@echo off
echo ======================================
echo     Starting MeetingMind Backend      
echo ======================================

:: Move to the directory where the script is located
cd /d "%~dp0"

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in your PATH.
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist "backend\venv\" (
    echo Creating virtual environment...
    python -m venv backend\venv
)

:: Activate the virtual environment
echo Activating virtual environment...
call backend\venv\Scripts\activate.bat

:: Install requirements
echo Installing/verifying dependencies...
pip install -r backend\requirements.txt

:: Start the server using Uvicorn
echo Starting Local AI Summariser on port 8000...
uvicorn backend.main:app --reload
