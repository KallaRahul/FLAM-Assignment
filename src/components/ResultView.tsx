import React, { useState } from 'react';
import type { StudySessionData } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizModule } from './QuizModule';
import { SummaryView } from './SummaryView';
import { MindMapView } from './MindMapView';
import { RefinementBar } from './RefinementBar';
import { BookOpen, HelpCircle, Layers, GitFork, Clock, FileJson, FileText, Check } from 'lucide-react';
import { exportSessionAsJson, exportSessionAsMarkdown } from '../lib/storage';

interface ResultViewProps {
  data: StudySessionData;
  onRefine: (refinementPrompt: string) => void;
  isRefining: boolean;
  isMockMode?: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  data,
  onRefine,
  isRefining,
  isMockMode,
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'summary' | 'mindmap'>('flashcards');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleExportJson = () => {
    exportSessionAsJson({ id: 'current', createdAt: data.generatedAt, prompt: '', data });
    triggerNotification();
  };

  const handleExportMarkdown = () => {
    exportSessionAsMarkdown({ id: 'current', createdAt: data.generatedAt, prompt: '', data });
    triggerNotification();
  };

  const triggerNotification = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="result-view-wrapper">
      {/* Session Title & Metadata Bar */}
      <div className="result-header-card font-sans">
        <div className="result-header-top">
          <div>
            <div className="category-pill-row font-mono">
              <span className="category-pill">{data.subjectCategory}</span>
              <span className="time-pill">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-indigo-400" /> ~{data.estimatedStudyTimeMinutes} min study
              </span>
              {isMockMode && (
                <span className="mock-pill" title="Generated using intelligent local mock engine">
                  Mock Engine Data
                </span>
              )}
            </div>
            <h2 className="result-main-title">{data.title}</h2>
            <p className="result-main-desc">{data.description}</p>
          </div>

          <div className="export-btn-group font-mono">
            <button
              onClick={handleExportJson}
              className="export-action-btn"
              title="Export structured session as JSON file"
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="export-action-btn"
              title="Export formatted notes as Markdown (.md)"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Export .MD</span>
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="notification-toast">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>File exported successfully!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="result-tabs-row font-mono">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
          >
            <Layers className="tab-icon" />
            <span>Flashcards</span>
            <span className="tab-count">{data.flashcards.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          >
            <HelpCircle className="tab-icon" />
            <span>Interactive Quiz</span>
            <span className="tab-count">{data.quiz.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          >
            <BookOpen className="tab-icon" />
            <span>Key Takeaways</span>
            <span className="tab-count">{data.summary.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('mindmap')}
            className={`tab-btn ${activeTab === 'mindmap' ? 'active' : ''}`}
          >
            <GitFork className="tab-icon" />
            <span>Knowledge Tree</span>
            <span className="tab-count">{data.mindMap.length}</span>
          </button>
        </div>
      </div>

      {/* Active Tab View Content */}
      <div className="tab-content-area">
        {activeTab === 'flashcards' && <FlashcardDeck cards={data.flashcards} />}
        {activeTab === 'quiz' && <QuizModule quiz={data.quiz} />}
        {activeTab === 'summary' && <SummaryView summary={data.summary} />}
        {activeTab === 'mindmap' && <MindMapView nodes={data.mindMap} />}
      </div>

      {/* Refinement Loop Bar */}
      <RefinementBar onRefine={onRefine} isRefining={isRefining} />
    </div>
  );
};
