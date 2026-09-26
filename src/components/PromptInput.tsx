import React, { useState, useRef } from 'react';
import { Sparkles, X, Wand2, AlertTriangle, Play } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: '⚡ React Hooks & State',
    text: `React Hooks & Virtual DOM rendering lifecycle: Explain useState, useEffect, useRef, useMemo, custom hooks, state immutability, component re-rendering triggers, and defensive state management in web applications.`
  },
  {
    label: '🧬 Quantum Physics',
    text: `Quantum Physics & Wave-Particle Duality: Cover wave-particle duality, Heisenberg uncertainty principle, Schrödinger equation, quantum superposition, quantum entanglement, and real-world applications in computing.`
  },
  {
    label: '🏛 World War II Turning Points',
    text: `World War II Key Battles & Turning Points: Major causes, Battle of Stalingrad, Midway, D-Day Invasion of Normandy, Manhattan Project, atomic bombs, and geopolitical consequences forming the Cold War.`
  },
  {
    label: '🌳 Data Structures & Algorithms',
    text: `Binary Search Trees, Graphs, & Time Complexity: BST insertion and traversal (In-order, Pre-order, Post-order), BFS vs DFS graph search, Dijkstra algorithm, Big-O notation time/space complexity analysis.`
  }
];

const TEST_FLAGS = [
  { flag: '[test-error:malformed]', label: 'Malformed JSON Error' },
  { flag: '[test-error:wrong-shape]', label: 'Wrong Shape Error' },
  { flag: '[test-error:500]', label: '500 Server Error' },
  { flag: '[test-error:slow]', label: 'Slow Response (6s)' },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const applyPreset = (text: string) => {
    setPrompt(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const appendTestFlag = (flag: string) => {
    if (prompt.includes(flag)) return;
    setPrompt((prev) => `${prev.trim()} ${flag}`.trim());
  };

  return (
    <div className="prompt-card">
      <div className="prompt-header">
        <div className="prompt-title-group">
          <Wand2 className="prompt-icon" />
          <div>
            <h2 className="prompt-title">Paste Study Notes, Articles, or Topics</h2>
            <p className="prompt-subtitle">
              Input raw free-form text. The backend calls the LLM, validates the structured JSON output defensively, and renders an interactive study suite.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Paste notes on Photosynthesis, Machine Learning algorithms, or JavaScript Event Loops..."
            rows={5}
            disabled={isLoading}
            className="prompt-textarea"
          />

          {prompt && !isLoading && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="clear-btn"
              title="Clear input"
              aria-label="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="textarea-footer">
            <span className="char-count">
              {prompt.length} characters | <kbd className="shortcut-key">Ctrl</kbd> + <kbd className="shortcut-key">Enter</kbd> to submit
            </span>
          </div>
        </div>

        {/* Presets & Evaluator Diagnostic Test Flags */}
        <div className="prompt-controls-bar">
          <div className="presets-group">
            <span className="presets-label">Sample Presets:</span>
            <div className="presets-scroll">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.text)}
                  disabled={isLoading}
                  className="preset-chip"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="test-flags-group">
            <span className="test-flags-label" title="Append diagnostic test flags to test bad LLM output handling live">
              <AlertTriangle className="flag-icon" /> Failure Simulation Flags:
            </span>
            <div className="presets-scroll">
              {TEST_FLAGS.map((tf, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendTestFlag(tf.flag)}
                  disabled={isLoading}
                  className={`flag-chip ${prompt.includes(tf.flag) ? 'flag-chip-active' : ''}`}
                  title={`Click to append ${tf.flag} to test failure handling`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="submit-bar">
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="submit-btn"
          >
            {isLoading ? (
              <>
                <Sparkles className="btn-spinner" />
                <span>Processing AI Output...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Generate Interactive Study Suite</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
