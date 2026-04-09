import { useState, useEffect } from 'react';

function SettingsView({ onClose }) {
  const [url, setUrl] = useState("http://localhost:8000");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(['apiUrl'], (data) => {
      if (data.apiUrl) setUrl(data.apiUrl);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ apiUrl: url }, () => {
      setSaveStatus("Saved! Reload extension to apply.");
      setTimeout(() => setSaveStatus(""), 3000);
    });
  };

  return (
    <div className="settings-view">
      <h3>Settings</h3>
      <div className="form-group">
        <label>API URL</label>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="http://localhost:8000"
        />
        <p className="hint">Point this to your cloud URL (e.g. Render or HuggingFace) or localhost.</p>
      </div>
      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSave}>Save Settings</button>
        <button className="btn-secondary" onClick={onClose}>Done</button>
      </div>
      {saveStatus && <p className="save-status">{saveStatus}</p>}
    </div>
  );
}

export default SettingsView;
