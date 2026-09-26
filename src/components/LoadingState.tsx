import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Cpu, Code2, AlertOctagon, XCircle } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
}

const STEPS = [
  { text: 'Routing request through backend server proxy...', icon: Cpu },
  { text: 'Requesting structured JSON from AI model...', icon: Code2 },
  { text: 'Executing defensive schema validation (validateResult.ts)...', icon: ShieldCheck },
  { text: 'Constructing interactive Flashcards & Quiz components...', icon: AlertOctagon },
];

const TIPS = [
  'Pro Tip: API keys are securely stored in server environment variables and never bundled into browser code.',
  'Did you know? CogniCraft validates raw AI strings against strict structural schemas before any component renders.',
  'Stale Request Protection: If you submit a new prompt, pending async responses are automatically cancelled.',
  'Defensive Parsing: If the model returns malformed JSON or invalid keys, CogniCraft routes gracefully to error recovery.'
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="loading-card" role="status">
      <div className="loading-content">
        <div className="spinner-glow-wrap">
          <Loader2 className="loading-spinner" />
        </div>

        <h3 className="loading-title">Generating Interactive Study Suite</h3>
        <p className="loading-subtitle">
          Transforming free-form text into validated structured components...
        </p>

        {/* Step Progress */}
        <div className="steps-container">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`step-item ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-active' : ''}`}
              >
                <div className="step-icon-wrap">
                  {isDone ? (
                    <span className="step-checkmark">✓</span>
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 opacity-50" />
                  )}
                </div>
                <span className="step-text">{step.text}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Tip Box */}
        <div className="tip-box">
          <span className="tip-label">LIGHTBULB</span>
          <p className="tip-text">{TIPS[currentTipIndex]}</p>
        </div>

        {onCancel && (
          <button onClick={onCancel} className="cancel-req-btn">
            <XCircle className="w-4 h-4" />
            <span>Cancel Request</span>
          </button>
        )}
      </div>
    </div>
  );
};
