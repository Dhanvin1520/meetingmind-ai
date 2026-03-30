import { useState } from 'react';
import './Download.css';
const STEPS = [
  { label: 'Clone the repo', code: 'git clone https://github.com/Dhanvin1520/meetingmind-ai.git' },
  { label: 'Build the popup', code: 'cd extension/popup && npm install && npm run build' },
  { label: 'Open Chrome extensions', code: 'chrome://extensions/' },
  { label: 'Load the extension', code: 'Click "Load unpacked" → Select meetingmind/extension/' },
];
export default function Download() {
  const [copied, setCopied] = useState(null);
  const handleCopy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <section className="section download" id="download">
      <div className="container">
        <div className="section-center">
          <div className="section-label">Free & Open Source</div>
          <h2 className="section-title">Get MeetingMind in 4 steps.</h2>
          <p className="section-sub">No account. No subscription. No data leaving your infrastructure. Just a better meeting experience.</p>
        </div>
        <div className="download__layout">
          {}
          <div className="download__steps">
            {STEPS.map((step, i) => (
              <div key={i} className="dl-step glass-card">
                <div className="dl-step__num">{String(i + 1).padStart(2, '0')}</div>
                <div className="dl-step__body">
                  <div className="dl-step__label">{step.label}</div>
                  <div className="dl-step__code">
                    <code>{step.code}</code>
                    <button className="copy-btn" onClick={() => handleCopy(step.code, i)}>
                      {copied === i ? '✓ Copied' : '⧉ Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {}
          <div className="download__cta-card">
            <div className="cta-badge">Chrome Extension · MV3</div>
            <h3>Ready to transform<br/>your meetings?</h3>
            <p>Fully open-source. Fine-tune the model yourself or use BART zero-shot until you have a GPU.</p>
            <a
              href="https://github.com/Dhanvin1520/meetingmind-ai"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>
            <div className="cta-meta">
              <span>⭐ Star us on GitHub</span>
              <span>·</span>
              <span>MIT License</span>
            </div>
            <div className="cta-tech-stack">
              {['Python 3.10+', 'Node 18+', 'MongoDB', 'Chrome 112+'].map(t => (
                <span key={t} className="tech-badge">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
