import './Download.css';

export default function Download() {
  return (
    <section className="section download" id="download">
      <div className="container">
        <div className="section-center">
          <div className="section-label">Free &amp; Open Source</div>
          <h2 className="section-title">Chrome Extension</h2>
          <p className="section-sub">No account. No subscription. No data leaving your infrastructure.</p>
        </div>

        <div className="coming-soon-card glass-card">
          <div className="cs-icon">🚧</div>
          <div className="cs-badge">Under Construction</div>
          <h3 className="cs-title">Coming Soon</h3>
          <p className="cs-desc">
            We're putting the finishing touches on the one-click extension installer.
            Stay tuned — it's almost ready.
          </p>

          <div className="cs-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
