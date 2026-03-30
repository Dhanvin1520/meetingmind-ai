import { useEffect, useRef } from 'react';
import './Hero.css';
export default function Hero() {
  useEffect(() => {
    const lines = document.querySelectorAll('.transcript-line');
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('visible');
      }, 600 + i * 700);
    });
  }, []);
  return (
    <section className="hero">
      <div className="container hero__layout">
        {}
        <div className="hero__text">
          <div className="section-label fade-up">
            <span className="live-dot" />
            Available Free · Open Source
          </div>
          <h1 className="hero__headline fade-up delay-1">
            Your meetings,<br />
            <span>summarised by AI</span><br />
            you own.
          </h1>
          <p className="hero__sub fade-up delay-2">
            MeetingMind captures live Google Meet audio, transcribes it in real-time,
            and generates structured summaries using a <strong>self-hosted fine-tuned BART model</strong>.
            Zero tokens sent to OpenAI. Zero trust required.
          </p>
          <div className="hero__ctas fade-up delay-3">
            <a href="#download" className="btn-primary">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download Extension
            </a>
            <a href="#how-it-works" className="btn-outline">
              See How It Works →
            </a>
          </div>
          <div className="hero__stats fade-up delay-4">
            <div className="stat">
              <span className="stat__num">100%</span>
              <span className="stat__label">Local AI</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat__num">0</span>
              <span className="stat__label">API Costs</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat__num">60s</span>
              <span className="stat__label">Summary Time</span>
            </div>
          </div>
        </div>
        {}
        <div className="hero__visual fade-in delay-2">
          <div className="browser-chrome">
            <div className="browser-top">
              <div className="dots">
                <span style={{background:'#ff5f57'}}/><span style={{background:'#ffbd2e'}}/><span style={{background:'#28c840'}}/>
              </div>
              <div className="browser-url">meet.google.com</div>
            </div>
            {}
            <div className="browser-body">
              <div className="meet-bg">
                <div className="meet-grid">
                  <div className="meet-tile">
                    <div className="avatar">A</div>
                    <span>Alice</span>
                  </div>
                  <div className="meet-tile">
                    <div className="avatar" style={{background:'#7c3aed'}}>B</div>
                    <span>Bob</span>
                  </div>
                  <div className="meet-tile">
                    <div className="avatar" style={{background:'#059669'}}>C</div>
                    <span>Charlie</span>
                  </div>
                  <div className="meet-tile you-tile">
                    <div className="avatar" style={{background:'#b45309'}}>Y</div>
                    <span>You</span>
                  </div>
                </div>
              </div>
              {}
              <div className="ext-popup">
                <div className="ext-header">
                  <span className="ext-logo">M</span>
                  <span>Meeting<b>Mind</b></span>
                  <div className="rec-badge">
                    <span className="rec-dot" />
                    REC
                  </div>
                </div>
                <div className="ext-transcript">
                  <div className="ext-transcript-label">LIVE TRANSCRIPT</div>
                  {[
                    { speaker: 'Alice', text: '"Q3 roadmap looks solid..."' },
                    { speaker: 'Bob', text: '"We need onboarding flow done by Friday."' },
                    { speaker: 'Charlie', text: '"Charlie will handle the API docs."' },
                  ].map((line, i) => (
                    <div key={i} className={`transcript-line`} style={{'--d': `${0.6 + i * 0.7}s`}}>
                      <span className="t-speaker">{line.speaker}:</span>
                      <span className="t-text">{line.text}</span>
                    </div>
                  ))}
                </div>
                <button className="ext-stop-btn">
                  ▪ Stop &amp; Summarise
                </button>
              </div>
            </div>
          </div>
          {}
          <div className="floating-summary glass-card">
            <div className="fs-tag">✦ AI Summary Ready</div>
            <div className="fs-tldr"><strong>TL;DR:</strong> Team agreed to prioritise user onboarding. Charlie owns API docs.</div>
            <div className="fs-items">
              <div>☐ Alice — Finish UX flow by Fri</div>
              <div>☐ Charlie — API documentation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
