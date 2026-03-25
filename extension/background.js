const API_BASE = "http:
let currentSessionId = null;
let isRecording = false;
chrome.runtime.onInstalled.addListener(() => {
  console.log("MeetingMind Background Worker Installed");
  chrome.storage.session.set({
    sessionId: null,
    isRecording: false,
    summary: null
  });
});
function updateState(updates) {
  if (updates.sessionId !== undefined) currentSessionId = updates.sessionId;
  if (updates.isRecording !== undefined) isRecording = updates.isRecording;
  chrome.storage.session.set(updates);
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_MEETING") {
    handleStartMeeting(message.payload).then(sendResponse);
    return true; 
  }
  if (message.type === "STOP_MEETING") {
    handleStopMeeting().then(sendResponse);
    return true;
  }
  if (message.type === "TRANSCRIPT_CHUNK") {
    handleTranscriptChunk(message.payload);
  }
  if (message.type === "LIVE_TRANSCRIPT") {
    chrome.storage.session.set({
      liveTranscript: message.payload.text
    });
  }
});
async function handleStartMeeting(payload) {
  try {
    const res = await fetch(`${API_BASE}/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meeting_title: payload.title || "Ad-hoc Meeting",
        participant_names: payload.participants || []
      })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    const data = await res.json();
    updateState({
      sessionId: data.session_id,
      isRecording: true,
      summary: null,
      liveTranscript: ""
    });
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "START_RECORDING" });
    }
    return { success: true, sessionId: data.session_id };
  } catch (error) {
    console.error("Start Meeting Error:", error);
    return { success: false, error: error.message };
  }
}
async function handleTranscriptChunk(chunkPayload) {
  if (!currentSessionId) {
    console.warn("Received chunk but no active session_id");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/transcript/chunk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: currentSessionId,
        chunk_index: chunkPayload.chunk_index,
        text: chunkPayload.text,
        timestamp_start: chunkPayload.timestamp_start,
        timestamp_end: chunkPayload.timestamp_end
      })
    });
    if (!res.ok) console.error("Chunk upload failed:", res.statusText);
  } catch (error) {
    console.error("Chunk network error:", error);
  }
}
async function handleStopMeeting() {
  if (!currentSessionId) return { success: false, error: "No active session" };
  const sid = currentSessionId;
  updateState({
    isRecording: false,
    liveTranscript: "" 
  });
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_RECORDING" });
  }
  try {
    await fetch(`${API_BASE}/session/${sid}/stop`, { method: "POST" });
    const res = await fetch(`${API_BASE}/summary/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid })
    });
    if (!res.ok) throw new Error(`Summary Error: ${res.statusText}`);
    const summaryData = await res.json();
    chrome.storage.session.set({ summary: summaryData });
    return { success: true, summary: summaryData };
  } catch (error) {
    console.error("Stop Meeting / Summary Error:", error);
    chrome.storage.session.set({ 
      summary: { error: error.message || "Failed to generate summary" } 
    });
    return { success: false, error: error.message };
  }
}
