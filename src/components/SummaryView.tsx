import React, { useState } from 'react';
import type { SummaryPoint } from '../types/result';
import { BookOpen, Lightbulb, AlertTriangle, Check, Copy, Hash } from 'lucide-react';

interface SummaryViewProps {
  summary: SummaryPoint[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const getIcon = (type: SummaryPoint['iconType']) => {
    switch (type) {
      case 'formula':
        return <Hash className="w-4 h-4 text-purple-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-emerald-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
    }
  };

  const copySectionText = (item: SummaryPoint) => {
    const text = `${item.topic}\n` + item.points.map((p) => `• ${p}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = filterType === 'all'
    ? summary
    : summary.filter((s) => s.iconType === filterType);

  if (summary.length === 0) {
    return <div className="empty-summary">No key concepts generated.</div>;
  }

  return (
    <div className="summary-module">
      {/* Category Filter Bar */}
      <div className="summary-toolbar">
        <span className="toolbar-title font-mono">Key Takeaways & Concepts</span>
        <div className="filter-chips">
          {['all', 'concept', 'formula', 'warning', 'tip'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`deck-filter-btn ${filterType === t ? 'active' : ''}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="summary-grid">
        {filtered.map((item) => (
          <div key={item.id} className="summary-card">
            <div className="summary-card-header">
              <div className="summary-title-group">
                <div className="summary-icon-wrap">{getIcon(item.iconType)}</div>
                <h3 className="summary-topic-title">{item.topic}</h3>
              </div>

              <button
                onClick={() => copySectionText(item)}
                className="copy-btn"
                title="Copy section notes"
                aria-label="Copy section"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <ul className="summary-points-list font-sans">
              {item.points.map((pt, pIdx) => (
                <li key={pIdx} className="summary-point-item">
                  <span className="bullet-dot">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
