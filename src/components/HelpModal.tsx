import React from 'react';
import { X, Keyboard, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="modal-title font-mono">CogniCraft AI — Evaluator & User Guide</h3>
          </div>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body font-sans">
          {/* Architecture overview */}
          <div className="help-section">
            <h4 className="help-heading font-mono">
              <Cpu className="w-4 h-4 inline mr-1 text-cyan-400" /> Architecture & Key Isolation
            </h4>
            <p className="help-text">
              All LLM API calls are routed through an Express backend proxy server (<code>/api/generate</code>).
              API keys are isolated on the server and never exposed in browser network requests or bundle files.
              If no API key is set, the server runs an intelligent mock generator to ensure 100% test reliability.
            </p>
          </div>

          {/* Failure simulation flags */}
          <div className="help-section">
            <h4 className="help-heading font-mono text-amber-400">
              <ShieldAlert className="w-4 h-4 inline mr-1 text-amber-400" /> Evaluator Failure Testing Flags
            </h4>
            <p className="help-text">
              Append any of these special flags in your input prompt to test how CogniCraft handles model failure modes:
            </p>
            <ul className="flag-guide-list font-mono">
              <li><code>[test-error:malformed]</code> — Triggers unclosed JSON syntax errors (intercepted by <code>validateResult.ts</code>).</li>
              <li><code>[test-error:wrong-shape]</code> — Returns valid JSON missing required <code>flashcards</code> or <code>quiz</code> arrays.</li>
              <li><code>[test-error:empty]</code> — Returns a blank/null string.</li>
              <li><code>[test-error:500]</code> — Simulates a HTTP 500 internal server error.</li>
              <li><code>[test-error:slow]</code> — Introduces a 6-second artificial delay to test race condition cancellation guards.</li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="help-section">
            <h4 className="help-heading font-mono">
              <Keyboard className="w-4 h-4 inline mr-1 text-emerald-400" /> Keyboard Shortcuts
            </h4>
            <div className="shortcuts-grid font-mono">
              <div className="shortcut-row">
                <kbd className="shortcut-key">Ctrl / Cmd + Enter</kbd>
                <span>Submit prompt to generate study set</span>
              </div>
              <div className="shortcut-row">
                <kbd className="shortcut-key">Spacebar</kbd>
                <span>Flip active flashcard (Front ↔ Back)</span>
              </div>
              <div className="shortcut-row">
                <kbd className="shortcut-key">←</kbd> <kbd className="shortcut-key">→</kbd>
                <span>Navigate Previous / Next flashcard</span>
              </div>
              <div className="shortcut-row">
                <kbd className="shortcut-key">1</kbd> - <kbd className="shortcut-key">4</kbd>
                <span>Select multiple choice quiz options</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
