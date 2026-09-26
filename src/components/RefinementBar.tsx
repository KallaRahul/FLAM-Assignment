import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw } from 'lucide-react';

interface RefinementBarProps {
  onRefine: (refinementPrompt: string) => void;
  isRefining: boolean;
}

const REFINEMENT_PRESETS = [
  '➕ Add 3 harder flashcards on edge cases',
  '🎯 Add 2 practical code scenario quiz questions',
  '💡 Explain key concepts in simpler terms',
  '⏱ Adjust estimated study time & summary bullet points'
];

export const RefinementBar: React.FC<RefinementBarProps> = ({ onRefine, isRefining }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRefining) return;
    onRefine(prompt.trim());
    setPrompt('');
  };

  const applyPreset = (text: string) => {
    if (isRefining) return;
    onRefine(text.replace(/^[^\s]+\s*/, '')); // Strip emoji
  };

  return (
    <div className="refinement-container font-sans">
      <div className="refinement-header-group">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <div>
          <h4 className="refinement-title font-mono">Refinement Loop — Follow-up Prompt Edit</h4>
          <p className="refinement-subtitle">
            Refine or extend this active study set without regenerating from scratch.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="refinement-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Add 3 more flashcards about topic X, or make quiz options harder..."
          disabled={isRefining}
          className="refinement-input"
        />

        <button
          type="submit"
          disabled={!prompt.trim() || isRefining}
          className="refinement-submit-btn"
        >
          {isRefining ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Refining...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Refine Set</span>
            </>
          )}
        </button>
      </form>

      <div className="refinement-presets-row font-sans">
        <span className="preset-label font-mono">Quick Refinements:</span>
        <div className="preset-buttons">
          {REFINEMENT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={isRefining}
              className="refinement-chip"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
