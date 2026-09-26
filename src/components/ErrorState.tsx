import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Code, Sparkles } from 'lucide-react';
import type { ApiErrorResponse } from '../types/result';

interface ErrorStateProps {
  error: {
    message: string;
    code: ApiErrorResponse['code'];
    details?: string;
    rawOutputSnippet?: string;
  };
  onRetry: () => void;
  onTryPreset?: () => void;
}

const ERROR_DESCRIPTIONS: Record<ApiErrorResponse['code'], string> = {
  MALFORMED_JSON: 'The model returned syntax errors or broken quotes in its JSON string. Our defensive parser intercepted it before rendering.',
  INVALID_SHAPE: 'The response was valid JSON but lacked required arrays like "flashcards" or "quiz". Schema validation rejected the unexpected payload shape.',
  EMPTY_RESPONSE: 'The AI model or server returned a blank or null string.',
  RATE_LIMIT: 'Upstream API rate limits or quota exceeded.',
  SERVER_ERROR: 'The backend proxy encountered an internal error.',
  NETWORK_ERROR: 'Unable to establish HTTP connection to the backend server proxy.',
};

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onTryPreset }) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="error-card" role="alert">
      <div className="error-header-group">
        <div className="error-icon-wrap">
          <AlertTriangle className="error-icon" />
        </div>
        <div>
          <div className="error-badge-row">
            <span className="error-code-badge">{error.code || 'UNKNOWN_ERROR'}</span>
            <span className="error-category-badge">Intercepted by validateResult.ts</span>
          </div>
          <h3 className="error-title">{error.message}</h3>
          <p className="error-description">
            {ERROR_DESCRIPTIONS[error.code] || 'An unexpected error occurred during processing.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="error-actions-row">
        <button onClick={onRetry} className="retry-btn">
          <RefreshCw className="w-4 h-4" />
          <span>Retry Prompt</span>
        </button>

        {onTryPreset && (
          <button onClick={onTryPreset} className="preset-fallback-btn">
            <Sparkles className="w-4 h-4" />
            <span>Load Working Sample Preset</span>
          </button>
        )}

        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="diagnostics-toggle-btn"
        >
          <Code className="w-4 h-4" />
          <span>{showDiagnostics ? 'Hide Diagnostic Logs' : 'View Diagnostic Logs'}</span>
          {showDiagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Diagnostic Collapsible Inspector */}
      {showDiagnostics && (
        <div className="diagnostics-panel">
          <h4 className="diagnostics-heading">Technical Diagnostic Breakdown:</h4>
          
          {error.details && (
            <div className="diag-section">
              <span className="diag-label">Validation Error Details:</span>
              <pre className="diag-code">{error.details}</pre>
            </div>
          )}

          {error.rawOutputSnippet && (
            <div className="diag-section">
              <span className="diag-label">Raw Model Output Snippet (First 300 chars):</span>
              <pre className="diag-code diag-raw">{error.rawOutputSnippet}</pre>
            </div>
          )}

          <div className="diag-explanation font-mono">
            💡 CogniCraft UI protection active: The raw payload was safely discarded before any DOM components were mounted. No React crashes or white screens occurred.
          </div>
        </div>
      )}
    </div>
  );
};
