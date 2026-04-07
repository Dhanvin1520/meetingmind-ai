import { useState, useEffect } from 'react';
import Controls from './components/Controls';
import TranscriptView from './components/TranscriptView';
import SummaryView from './components/SummaryView';
import SettingsView from './components/SettingsView';
import { Settings, X } from 'lucide-react';
function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); 
  const [view, setView] = useState('main'); 
  useEffect(() => {
    if (!chrome?.storage?.session) return;
    const loadState = async () => {
      const data = await chrome.storage.session.get([
        'isRecording', 'sessionId', 'liveTranscript', 'summary'
      ]);
      if (data.isRecording !== undefined) setIsRecording(data.isRecording);
      if (data.sessionId !== undefined) setSessionId(data.sessionId);
      if (data.liveTranscript !== undefined) setLiveTranscript(data.liveTranscript);
      if (data.summary !== undefined) {
        setSummary(data.summary);
        if (data.summary?.error) setError(data.summary.error);
      }
    };
    loadState();
    const listener = (changes) => {
      if (changes.isRecording) setIsRecording(changes.isRecording.newValue);
      if (changes.liveTranscript) setLiveTranscript(changes.liveTranscript.newValue || "");
      if (changes.summary) {
        setSummary(changes.summary.newValue);
        setIsGenerating(false);
        if (changes.summary.newValue?.error) {
          setError(changes.summary.newValue.error);
        } else {
          setError(null);
        }
      }
    };
    chrome.storage.session.onChanged.addListener(listener);
    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const storage = await chrome.storage.sync.get(['apiUrl']);
        const baseUrl = storage.apiUrl || 'http://localhost:8000';
        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/health`);
        if (res.ok) setBackendStatus('online');
        else setBackendStatus('offline');
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, [view]); 
  const handleStart = async (title, participants) => {
    setError(null);
    setSummary(null);
    try {
      if (!chrome?.runtime) throw new Error("Not in extension env");
      const res = await chrome.runtime.sendMessage({
        type: "START_MEETING",
        payload: { title, participants }
      });
      if (res && res.error) throw new Error(res.error);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleStop = async () => {
    setIsGenerating(true);
    try {
      if (!chrome?.runtime) throw new Error("Not in extension env");
      const res = await chrome.runtime.sendMessage({ type: "STOP_MEETING" });
      if (res && res.error) throw new Error(res.error);
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MeetingMind</h1>
        <div className="header-right">
          <span className="app-subtitle">Local AI Summariser</span>
          {view === 'main' ? (
            <Settings id="settings-toggle" size={18} onClick={() => setView('settings')} style={{marginLeft: '12px'}} />
          ) : (
            <X id="settings-toggle" size={18} onClick={() => setView('main')} style={{marginLeft: '12px'}} />
          )}
        </div>
      </header>
      <main className="app-main">
        {view === 'settings' ? (
          <SettingsView onClose={() => setView('main')} />
        ) : (
          <>
            {backendStatus === 'offline' && (
              <div className="error-banner offline">
                ⚠️ Backend Offline. Run <code>start_meetingmind.py</code>
              </div>
            )}
            {error && <div className="error-banner">{error}</div>}
            <Controls 
              onStart={handleStart} 
              onStop={handleStop} 
              isRecording={isRecording}
              isGenerating={isGenerating}
            />
            {isRecording && (
              <TranscriptView text={liveTranscript} />
            )}
            {!isRecording && isGenerating && (
              <div className="generating-state">
                <div className="spinner"></div>
                <p>Running local BART model... This might take a moment.</p>
              </div>
            )}
            {!isRecording && summary && !summary.error && (
              <SummaryView summary={summary} />
            )}
            {!isRecording && !isGenerating && !summary && !error && (
              <div className="empty-state">
                <p>Ready to transcribe your next meeting.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
export default App;
