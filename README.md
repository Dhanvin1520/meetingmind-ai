# MeetingMind

A Chrome Extension and FastAPI backend that captures live Google Meet audio, transcribes it in real-time using the native browser Web Speech API, and generates structured meeting summaries using a **self-hosted, fine-tuned BART model**.

> **No external API calls to OpenAI or Groq.** The summarisation is 100% self-hosted.

---

## 1. Project Structure

- `ml/`: Scripts to fine-tune `facebook/bart-large-cnn` on the AMI Meeting Corpus.
- `backend/`: FastAPI server that loads the fine-tuned model and provides REST endpoints for the extension.
- `extension/`: Manifest V3 Chrome Extension containing the content script (audio capture), background worker (state sync), and a React popup UI.

---

## 2. ML Fine-Tuning

Wait! You don't have to fine-tune if you just want to run the app right away, but to get the best meeting-specific results, you should fine-tune the model.

**Requirements**: A GPU with at least 16GB VRAM is highly recommended.

1. `cd ml`
2. Configure a python virtual environment and `pip install -r requirements.txt`
3. Run the fine-tuning script:
   ```bash
   python fine_tune.py \
       --model_name facebook/bart-large-cnn \
       --output_dir ../checkpoints/bart-meeting/final \
       --num_train_epochs 5 \
       --batch_size 4
   ```
4. Evaluate your fine-tuned model against the zero-shot baseline:
   ```bash
   python evaluate.py --checkpoint ../checkpoints/bart-meeting/final
   ```

---

## 3. Backend Setup

The backend handles session state via MongoDB and runs the BART inference.

1. **Install MongoDB**: Ensure you have MongoDB running locally on port 27017.
2. `cd backend`
3. Install dependencies: `pip install -r requirements.txt`
4. Copy environment variables: `cp .env.example .env`
5. Edit `.env` to ensure `MODEL_CHECKPOINT` points to your fine-tuned model (or just `facebook/bart-large-cnn` if you skipped fine-tuning).
6. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

## 4. Chrome Extension Setup

The extension injects into `meet.google.com` to capture audio.

1. `cd extension/popup`
2. Install UI dependencies: `npm install`
3. Build the UI: `npm run build`
4. Open Chrome and go to `chrome://extensions/`
5. Enable **Developer Mode** in the top right.
6. Click **Load unpacked** and select the `meetingmind/extension/` directory.

---

## 5. Usage Guide

1. Keep the FastAPI backend (`uvicorn`) running in your terminal.
2. Join a **Google Meet** call.
3. Click the MeetingMind extension icon in your Chrome toolbar.
4. Enter a Meeting Title and basic Participants (comma-separated).
5. Click **Start Recording**.
   - Note: Chrome may prompt you to allow microphone access.
6. The popup will display a live rolling transcript.
7. When the meeting ends, click **Stop & Summarise**.
8. The backend will process the full transcript using the fine-tuned BART model.
9. You will see a structured summary (TL;DR, Action Items, Key Decisions) that you can copy to Markdown!
