import { Check, Clipboard, Download } from 'lucide-react';
import { useState } from 'react';
export default function SummaryView({ summary }) {
  const [copied, setCopied] = useState(false);
  if (!summary) return null;
  // Helper to generate a clean markdown string from the summary object
  const generateMarkdown = () => {
    let md = `# Meeting: ${summary.meeting_title || 'Meeting Summary'}\n`;
    md += `*Generated: ${new Date(summary.generated_at).toLocaleString()}*\n\n`;
    md += `## TL;DR\n${summary.tldr}\n\n`;
    md += `## Summary\n${summary.summary}\n\n`;
    if (summary.key_decisions && summary.key_decisions.length > 0) {
      md += `## Key Decisions\n`;
      summary.key_decisions.forEach(d => md += `- ${d}\n`);
      md += `\n`;
    }
    if (summary.action_items && summary.action_items.length > 0) {
      md += `## Action Items\n`;
      summary.action_items.forEach(a => {
        const owner = a.owner ? ` **(${a.owner})**` : '';
        md += `- [ ] ${a.description}${owner}\n`;
      });
      md += `\n`;
    }
    return md;
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(summary.meeting_title || 'meeting').replace(/\\s+/g, '_')}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="summary-container">
      <div className="summary-header">
        <h3>Meeting Summary</h3>
        <div className="summary-actions">
          <button onClick={handleCopy} className="btn btn-icon" title="Copy Markdown">
            {copied ? <Check size={16} className="text-green" /> : <Clipboard size={16} />}
          </button>
          <button onClick={handleDownload} className="btn btn-icon" title="Download .md">
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="summary-content">
        <div className="summary-section">
          <h4>TL;DR</h4>
          <p className="tldr-text">{summary.tldr}</p>
        </div>
        {summary.action_items?.length > 0 && (
          <div className="summary-section">
            <h4>Action Items</h4>
            <ul className="action-list">
              {summary.action_items.map((item, i) => (
                <li key={i}>
                  <span className="checkbox">☐</span>
                  <span className="item-desc">{item.description}</span>
                  {item.owner && <span className="item-owner">{item.owner}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.key_decisions?.length > 0 && (
          <div className="summary-section">
            <h4>Key Decisions</h4>
            <ul className="decision-list">
              {summary.key_decisions.map((dec, i) => (
                <li key={i}>{dec}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="summary-section">
          <h4>Full Notes</h4>
          <p className="full-summary-text">{summary.summary}</p>
        </div>
      </div>
    </div>
  );
}
