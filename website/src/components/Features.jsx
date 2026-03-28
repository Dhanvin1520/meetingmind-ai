import './Features.css';
const FEATURES = [
  {
    icon: '🔒',
    title: '100% Local AI',
    desc: 'The summarisation model runs on your own machine or your own cloud. Zero tokens sent to OpenAI, Anthropic, or any third-party LLM API.',
    accent: '#bb86fc',
  },
  {
    icon: '🧠',
    title: 'Fine-Tuned BART',
    desc: 'Not just a zero-shot prompt. A facebook/bart-large-cnn model specifically fine-tuned on the AMI Meeting Corpus for meeting-specific language.',
    accent: '#f59e0b',
  },
  {
    icon: '⚡',
    title: 'Real-Time Transcript',
    desc: 'Transcription starts the moment you click Record. Watch your conversation appear word by word inside the extension popup.',
    accent: '#03dac6',
  },
  {
    icon: '🕐',
    title: '1hr+ Meeting Ready',
    desc: 'Smart 30-second chunking with stateful MongoDB storage means no context is lost — even in 3-hour all hands meetings.',
    accent: '#4caf50',
  },
  {
    icon: '✅',
    title: 'Action Items Extracted',
    desc: 'Not just a wall of text. MeetingMind identifies task owners by name, e.g. "Alice will prepare the proposal by Friday".',
    accent: '#ef4444',
  },
  {
    icon: '📋',
    title: 'One-Click Markdown',
    desc: 'Export to clipboard or download as a Markdown file, ready to paste into Notion, Linear, Confluence, or email in seconds.',
    accent: '#6366f1',
  },
];
export default function Features() {
  return (
    <section className="section features" id="features">
      <div className="container">
        <div className="section-center">
          <div className="section-label">✦ Why MeetingMind</div>
          <h2 className="section-title">Built for people who <span className="gradient-text">respect their privacy.</span></h2>
          <p className="section-sub">Every design decision was made with one question: <em>"Does this need to leave my machine?"</em></p>
        </div>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card glass-card" style={{ '--accent-local': f.accent }}>
              <div className="feature-icon" style={{ color: f.accent }}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
