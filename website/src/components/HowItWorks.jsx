import { useEffect, useRef, useState } from 'react';
import './HowItWorks.css';
const STEPS = [
  {
    num: '01',
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
    title: 'Join & Start',
    desc: 'Open Google Meet and click the MeetingMind extension icon. Enter a meeting title and hit Start Recording.',
    detail: 'Chrome injects a content script that activates the Web Speech API inside the Meet tab. Audio captured stays on your device.',
    tag: 'Chrome Extension MV3',
  },
  {
    num: '02',
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    title: 'Live Transcription',
    desc: 'Watch your conversation transcribed in real-time inside the extension popup as you speak.',
    detail: 'Speech is buffered into 30-second smart chunks and sent to your local FastAPI server for stateful storage in MongoDB.',
    tag: 'Web Speech API + FastAPI',
  },
  {
    num: '03',
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    title: 'AI Summarisation',
    desc: 'Click Stop & Summarise. Your fine-tuned BART model processes the full transcript locally.',
    detail: 'The fine-tuned BART-large-cnn model extracts TL;DR, Action Items with owner names, and Key Decisions — all in-house.',
    tag: 'BART Fine-Tuned on AMI Corpus',
  },
  {
    num: '04',
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    title: 'Export & Share',
    desc: 'Copy the structured summary to your clipboard or download it as a formatted Markdown file.',
    detail: 'Action items are already formatted for Notion, Linear, or email. Nothing leaves your infrastructure.',
    tag: 'Markdown Export',
  },
];
export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section hiw" id="how-it-works" ref={sectionRef}>
      <div className="container">
        <div className="section-center">
          <div className="section-label">Step by Step</div>
          <h2 className="section-title">Zero friction. Just clarity.</h2>
          <p className="section-sub">From a chaotic hour-long standup to a clean structured summary in under 60 seconds.</p>
        </div>
        <div className={`hiw__steps ${isVisible ? 'is-visible' : ''}`}>
          {STEPS.map((step, i) => (
            <div key={i} className="hiw__step glass-card" style={{ '--i': i }}>
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              <div className="step-detail">{step.detail}</div>
              <div className="step-tag">{step.tag}</div>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
