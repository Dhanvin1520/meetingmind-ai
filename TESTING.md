# MeetingMind - User & Testing Guide

This guide explains how to set up, load, and test the MeetingMind extension and backend on your local machine.

## 1. Prerequisites
- **MongoDB**: Ensure MongoDB is running. I have started it for you using Homebrew.
- **Python**: Use the provided virtual environment for the backend.

## 2. Start the Backend
Open a terminal and run:
```bash
cd backend
./venv/bin/uvicorn main:app --reload --port 8000
```
On the first run, it will download the `BART` model (~1.6GB), so please wait for the message:
`=== Startup complete — ready to serve requests ===`

## 3. Load the Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** (top right corner).
3. Click **Load unpacked**.
4. Select the `extension/` directory (the one containing `manifest.json`).

## 4. How to Test
1. **Health Check**: Open [http://localhost:8000/health](http://localhost:8000/health) in your browser. It should show `{"status":"ok", ...}`.
2. **Google Meet**:
   - Join any Google Meet call (or start a new one).
   - Click the **MeetingMind** extension icon in your Chrome toolbar.
   - Enter a meeting title and click **Start Recording**.
   - Speak into your microphone. You should see a live transcript appearing in the popup.
3. **Summarization**:
   - Click **Stop & Summarise**.
   - Wait a moment for the AI to process. A summary with key decisions and action items will appear!

## 5. Troubleshooting
- **No Transcript**: Ensure you have granted microphone permissions to Google Meet.
- **Backend Error**: Check the terminal running the backend for any model loading or database connection errors.
