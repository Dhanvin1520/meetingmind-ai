import './LogoBar.css';
const TECH = [
  { name: 'PyTorch', icon: '🔥' },
  { name: 'HuggingFace', icon: '🤗' },
  { name: 'FastAPI', icon: '⚡' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Chrome MV3', icon: '🧩' },
  { name: 'React', icon: '⚛️' },
  { name: 'BART-Large', icon: '🤖' },
  { name: 'Three.js', icon: '🌐' },
];
export default function LogoBar() {
  return (
    <div className="logobar">
      <div className="logobar__label">Built with open-source technology</div>
      <div className="logobar__track">
        <div className="logobar__items">
          {[...TECH, ...TECH].map((t, i) => (
            <div key={i} className="logobar__chip">
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
