# MeetingMind Cloud Deployment Guide

To make MeetingMind "Always-On" and skip the local Python script, you can deploy the backend to the cloud.

## Recommended: Render (Free Tier)
Render is the easiest way to host this Dockerized FastAPI backend.

1.  **Fork this Repository** to your GitHub account.
2.  **Sign up at [Render.com](https://render.com)**.
3.  **Create a New Web Service**:
    - Connect your GitHub repository.
    - Render will automatically detect the `Dockerfile`.
4.  **Configure Environment Variables**:
    In the Render dashboard, add the following variables:
    - `MONGO_URI`: Your MongoDB connection string (same as in your `.env`).
    - `MONGO_DB_NAME`: `meetingmind`
    - `MODEL_CHECKPOINT`: `facebook/bart-large-cnn`
5.  **Deploy**: Click **Create Web Service**.
6.  **Update Extension**:
    - Once deployed, Render will give you a URL (e.g., `https://meetingmind-api.onrender.com`).
    - Open the MeetingMind extension popup.
    - Click the **Settings (⚙️)** icon.
    - Paste your Render URL into the **API URL** field and click **Save**.

## Alternative: Hugging Face Spaces
Since your `Dockerfile` is already configured for Hugging Face, you can also host it there for free.

1.  Create a new **Docker Space** on Hugging Face.
2.  Upload the repository files.
3.  Set your `.env` variables in the Space settings.
4.  Use the Space's Direct URL in the extension settings.

---

### Why Deploy to Cloud?
- **No Local Scripts**: You don't need to run `python3 start_meetingmind.py` anymore.
- **Portability**: Your extension will work on any computer you log into.
- **Always Ready**: The AI model will be ready to summarize as soon as your meeting ends.
