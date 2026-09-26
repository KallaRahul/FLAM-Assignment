import React from 'react';
import { Sparkles, Brain, History, HelpCircle, Cpu, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  hasApiKey: boolean;
  isMockMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenHelp,
  hasApiKey,
  isMockMode
}) => {
  return (
    <header className="header-bar">
      <div className="header-container">
        <div className="brand-logo">
          <div className="logo-icon-wrap">
            <Brain className="logo-icon" />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-name">CogniCraft AI</h1>
              <span className="brand-badge">STUDY SUITE</span>
            </div>
            <p className="brand-subtitle">Free-form Text → Structured Interactive Learning</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Engine Status Badge */}
          <div className="engine-badge-wrap" title={hasApiKey ? "Connected to live Google Gemini API backend" : "Running in intelligent mock fallback mode (No API key in .env)"}>
            {hasApiKey && !isMockMode ? (
              <span className="status-badge status-live">
                <Sparkles className="badge-icon spin-pulse" /> Live Gemini AI
              </span>
            ) : (
              <span className="status-badge status-mock">
                <Cpu className="badge-icon" /> {isMockMode ? 'Mock Generator Active' : 'Offline Mock Engine'}
              </span>
            )}
            <span className="security-badge" title="API keys are securely held on the backend server proxy and never exposed to the client browser.">
              <ShieldCheck className="shield-icon" /> Key Isolated
            </span>
          </div>

          <button
            onClick={onOpenHistory}
            className="header-btn"
            title="Saved Sessions & History"
            aria-label="Saved Sessions"
          >
            <History className="btn-icon" />
            <span className="btn-text">History</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="header-btn btn-ghost"
            title="Help & Diagnostics Guide"
            aria-label="Help Guide"
          >
            <HelpCircle className="btn-icon" />
            <span className="btn-text font-mono">FAQ & Shortcuts</span>
          </button>
        </div>
      </div>
    </header>
  );
};
