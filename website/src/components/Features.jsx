import './Features.css';
const FEATURES = [
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    title: '100% Local AI',
    desc: 'The summarisation model runs on your own machine or your own cloud. Zero tokens sent to OpenAI, Anthropic, or any third-party LLM API.',
    accent: '#3b82f6',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    title: 'Fine-Tuned BART',
    desc: 'Not just a zero-shot prompt. A facebook/bart-large-cnn model specifically fine-tuned on the AMI Meeting Corpus for meeting-specific language.',
    accent: '#f59e0b',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    title: 'Real-Time Transcript',
    desc: 'Transcription starts the moment you click Record. Watch your conversation appear word by word inside the extension popup.',
    accent: '#10b981',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    title: '1hr+ Meeting Ready',
    desc: 'Smart 30-second chunking with stateful MongoDB storage means no context is lost — even in 3-hour all hands meetings.',
    accent: '#22c55e',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    title: 'Action Items Extracted',
    desc: 'Not just a wall of text. MeetingMind identifies task owners by name, e.g. "Alice will prepare the proposal by Friday".',
    accent: '#ef4444',
  },
  {
    icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>,
    title: 'One-Click Markdown',
    desc: 'Export to clipboard or download as a Markdown file, ready to paste into Notion, Linear, Confluence, or email in seconds.',
    accent: '#8b5cf6',
  },
];
export default function Features() {
  return (
    <section className="section features" id="features">
      <div className="container">
        <div className="section-center">
          <div className="section-label">Why MeetingMind</div>
          <h2 className="section-title">Built for people who respect their privacy.</h2>
          <p className="section-sub">Every design decision was made with one question: <em>"Does this need to leave my machine?"</em></p>
        </div>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ '--accent-local': f.accent }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
