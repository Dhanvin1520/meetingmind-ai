import { useState } from 'react';
import { Play, Square, Mic } from 'lucide-react';
export default function Controls({ onStart, onStop, isRecording, isGenerating }) {
  const [title, setTitle] = useState("Weekly Sync");
  const [participants, setParticipants] = useState("");
  const handleStart = () => {
    const participantList = participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    onStart(title, participantList);
  };
  if (isGenerating) {
    return null; 
  }
  if (isRecording) {
    return (
      <div className="controls-active">
        <div className="recording-indicator">
          <Mic className="icon-pulse" size={16} />
          <span>Recording: {title}</span>
        </div>
        <button onClick={onStop} className="btn btn-danger">
          <Square size={16} />
          Stop & Summarise
        </button>
      </div>
    );
  }
  return (
    <div className="controls-setup">
      <div className="input-group">
        <label>Meeting Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q3 Planning"
        />
      </div>
      <div className="input-group">
        <label>Participants (comma separated)</label>
        <input 
          type="text" 
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="e.g. Alice, Bob, Charlie"
        />
      </div>
      <button onClick={handleStart} className="btn btn-primary">
        <Play size={16} />
        Start Recording
      </button>
    </div>
  );
}
