import './Footer.css';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="logo-icon">M</span>
            <span>Meeting<b>Mind</b></span>
          </div>
          <p>AI meeting summaries powered by a self-hosted fine-tuned BART model. Built with PyTorch, FastAPI, and Chrome MV3.</p>
          <p className="footer__copy">© 2025 MeetingMind · MIT License · Made by Dhanvin</p>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <div className="col-title">Product</div>
            <a href="#how-it-works">How It Works</a>
            <a href="#architecture">Architecture</a>
            <a href="#features">Features</a>
            <a href="#download">Download</a>
          </div>
          <div className="footer__col">
            <div className="col-title">Tech</div>
            <a href="https:
            <a href="https:
            <a href="https:
            <a href="https:
          </div>
          <div className="footer__col">
            <div className="col-title">Links</div>
            <a href="https:
            <a href="https:
            <a href="https:
          </div>
        </div>
      </div>
    </footer>
  );
}
