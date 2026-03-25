import { useEffect, useRef } from 'react';
export default function TranscriptView({ text }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);
  return (
    <div className="transcript-container">
      <h3>Live Transcript</h3>
      <div className="transcript-scroll" ref={containerRef}>
        {text ? (
          <p>{text}</p>
        ) : (
          <p className="placeholder-text">Listening for speech...</p>
        )}
      </div>
    </div>
  );
}
