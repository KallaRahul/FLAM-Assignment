import React from 'react';
import type { SavedSession } from '../types/result';
import { X, Calendar, BookOpen, Trash2, FileText, FileCode } from 'lucide-react';
import { exportSessionAsJson, exportSessionAsMarkdown } from '../lib/storage';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedSession[];
  onSelectSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="drawer-title font-mono">Saved Study Sessions</h3>
          </div>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close drawer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="drawer-body">
          {sessions.length === 0 ? (
            <div className="empty-history">
              <p>No saved study sessions yet.</p>
              <span className="text-xs text-slate-400">Generations are automatically saved here for quick reloading.</span>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map((sess) => (
                <div key={sess.id} className="session-item-card">
                  <div className="session-main font-sans">
                    <h4 className="session-item-title">{sess.data.title}</h4>
                    <p className="session-item-category font-mono">{sess.data.subjectCategory}</p>

                    <div className="session-meta">
                      <span><Calendar className="w-3.5 h-3.5 inline mr-1" />{new Date(sess.createdAt).toLocaleDateString()}</span>
                      <span>🎴 {sess.data.flashcards.length} cards</span>
                      <span>❓ {sess.data.quiz.length} questions</span>
                    </div>
                  </div>

                  <div className="session-item-actions">
                    <button
                      onClick={() => {
                        onSelectSession(sess);
                        onClose();
                      }}
                      className="load-session-btn"
                    >
                      Load Session
                    </button>

                    <div className="export-menu">
                      <button
                        onClick={() => exportSessionAsJson(sess)}
                        className="export-icon-btn"
                        title="Export as JSON"
                      >
                        <FileCode className="w-4 h-4 text-cyan-400" />
                      </button>
                      <button
                        onClick={() => exportSessionAsMarkdown(sess)}
                        className="export-icon-btn"
                        title="Export as Markdown (.md)"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => onDeleteSession(sess.id)}
                        className="export-icon-btn text-rose-400 hover:text-rose-300"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
