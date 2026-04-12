#!/bin/bash
echo "======================================"
echo "    Starting MeetingMind Backend      "
echo "======================================"

# Ensure we are in the repository root directory
cd "$(dirname "$0")"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null
then
    echo "Error: Python 3 is not installed or not in your PATH."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv backend/venv
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source backend/venv/bin/activate

# Install requirements
echo "Installing/verifying dependencies..."
pip install -r backend/requirements.txt

# Start the server using Uvicorn
echo "Starting Local AI Summariser on port 8000..."
uvicorn backend.main:app --reload
