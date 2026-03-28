import './HowItWorks.css';
const STEPS = [
  {
    num: '01',
    icon: '🎙️',
    title: 'Join & Start',
    desc: 'Open Google Meet and click the MeetingMind extension icon. Enter a meeting title and hit Start Recording.',
    detail: 'Chrome injects a content script that activates the Web Speech API inside the Meet tab. Audio captured stays on your device.',
    tag: 'Chrome Extension MV3',
  },
  {
    num: '02',
    icon: '📝',
    title: 'Live Transcription',
    desc: 'Watch your conversation transcribed in real-time inside the extension popup as you speak.',
    detail: 'Speech is buffered into 30-second smart chunks and sent to your local FastAPI server for stateful storage in MongoDB.',
    tag: 'Web Speech API + FastAPI',
  },
  {
    num: '03',
    icon: '🤖',
    title: 'AI Summarisation',
    desc: 'Click Stop & Summarise. Your fine-tuned BART model processes the full transcript locally.',
    detail: 'The fine-tuned BART-large-cnn model extracts TL;DR, Action Items with owner names, and Key Decisions — all in-house.',
    tag: 'BART Fine-Tuned on AMI Corpus',
  },
  {
    num: '04',
    icon: '📤',
    title: 'Export & Share',
    desc: 'Copy the structured summary to your clipboard or download it as a formatted Markdown file.',
    detail: 'Action items are already formatted for Notion, Linear, or email. Nothing leaves your infrastructure.',
    tag: 'Markdown Export',
  },
];
export default function HowItWorks() {
  return (
    <section className="section hiw" id="how-it-works">
      <div className="container">
        <div className="section-center">
          <div className="section-label">✦ Step by Step</div>
          <h2 className="section-title">Zero friction. <span className="gradient-text">Just clarity.</span></h2>
          <p className="section-sub">From a chaotic hour-long standup to a clean structured summary in under 60 seconds.</p>
        </div>
        <div className="hiw__steps">
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
