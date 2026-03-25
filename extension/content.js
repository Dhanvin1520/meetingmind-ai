let recognition = null;
let isRecording = false;
let sessionStartTime = null;
let currentChunkText = "";
let chunkIndex = 0;
let chunkStartTime = null;
let chunkTimer = null;
const CHUNK_DURATION_MS = 30000; 
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("MeetingMind: Web Speech API not supported in this browser.");
    return null;
  }
  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true; 
  rec.lang = "en-US";
  rec.onstart = () => {
    console.log("MeetingMind: Speech recognition started.");
    if (!chunkStartTime && isRecording) {
      chunkStartTime = Date.now();
      startChunkTimer();
    }
  };
  rec.onresult = (event) => {
    if (!isRecording) return;
    let interimTranscript = '';
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }
    if (finalTranscript) {
      currentChunkText += finalTranscript;
    }
    const liveText = currentChunkText + interimTranscript;
    chrome.runtime.sendMessage({
      type: "LIVE_TRANSCRIPT",
      payload: { text: liveText }
    }).catch(() => {  });
  };
  rec.onerror = (event) => {
    console.warn("MeetingMind: Speech recognition error:", event.error);
    if (isRecording && event.error !== "not-allowed") {
      setTimeout(() => {
        try { rec.start(); } catch (e) {}
      }, 1000);
    }
  };
  rec.onend = () => {
    console.log("MeetingMind: Speech recognition ended.");
    if (isRecording) {
      setTimeout(() => {
        try { rec.start(); } catch (e) {}
      }, 500);
    }
  };
  return rec;
}
function startChunkTimer() {
  if (chunkTimer) clearInterval(chunkTimer);
  chunkTimer = setInterval(() => {
    sendChunkToBackground();
  }, CHUNK_DURATION_MS);
}
function sendChunkToBackground() {
  if (!currentChunkText.trim()) {
    chunkStartTime = Date.now();
    return;
  }
  const now = Date.now();
  const timeStart = (chunkStartTime - sessionStartTime) / 1000;
  const timeEnd = (now - sessionStartTime) / 1000;
  console.log(`MeetingMind: Sending chunk ${chunkIndex} (${timeStart.toFixed(1)}s - ${timeEnd.toFixed(1)}s)`);
  chrome.runtime.sendMessage({
    type: "TRANSCRIPT_CHUNK",
    payload: {
      chunk_index: chunkIndex,
      text: currentChunkText.trim(),
      timestamp_start: timeStart,
      timestamp_end: timeEnd
    }
  });
  chunkIndex++;
  currentChunkText = "";
  chunkStartTime = now;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_RECORDING") {
    if (isRecording) {
      sendResponse({ status: "already_recording" });
      return;
    }
    isRecording = true;
    sessionStartTime = Date.now();
    chunkStartTime = null;
    chunkIndex = 0;
    currentChunkText = "";
    if (!recognition) {
      recognition = initSpeechRecognition();
    }
    if (recognition) {
      try {
        recognition.start();
        sendResponse({ status: "started" });
      } catch (e) {
        console.error("MeetingMind: Failed to start recognition:", e);
        sendResponse({ status: "error", error: e.message });
      }
    } else {
      sendResponse({ status: "error", error: "Web Speech API unavailable." });
    }
  } 
  else if (message.type === "STOP_RECORDING") {
    if (!isRecording) {
      sendResponse({ status: "already_stopped" });
      return;
    }
    if (currentChunkText.trim()) {
      sendChunkToBackground();
    }
    isRecording = false;
    if (chunkTimer) clearInterval(chunkTimer);
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }
    sendResponse({ status: "stopped" });
  }
  return true; 
});
console.log("MeetingMind: Content script loaded and ready.");
