import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ResultView } from './components/ResultView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HelpModal } from './components/HelpModal';
import { generateStudySession, checkServerHealth } from './lib/api';
import { getSavedSessions, saveSession, deleteSession } from './lib/storage';
import type { StudySessionData, SavedSession, ApiErrorResponse } from './types/result';

export const App: React.FC = () => {
  const [data, setData] = useState<StudySessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<{
    message: string;
    code: ApiErrorResponse['code'];
    details?: string;
    rawOutputSnippet?: string;
  } | null>(null);

  const [activePrompt, setActivePrompt] = useState<string>('');
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const [serverHealth, setServerHealth] = useState<{ status: string; hasApiKey: boolean }>({ status: 'checking', hasApiKey: false });

  // History & Help Modals
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => getSavedSessions());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Stale Request Protection & Abort Controller
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    checkServerHealth().then(setServerHealth);
  }, []);

  const handleGenerate = async (prompt: string, isRefinement = false) => {
    // 1. Cancel previous pending HTTP request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 2. Increment Request ID to guard against out-of-order stale promise resolution
    const currentId = ++requestIdRef.current;

    if (isRefinement) setIsRefining(true);
    else setIsLoading(true);

    setError(null);
    if (!isRefinement) setActivePrompt(prompt);

    try {
      const response = await generateStudySession({
        prompt,
        isRefinement,
        currentData: isRefinement ? (data || undefined) : undefined,
        signal: abortController.signal,
      });

      // Guard: Ignore if a newer request has started in the meantime
      if (currentId !== requestIdRef.current) {
        console.log(`[CogniCraft Guard] Ignored stale response for request #${currentId}`);
        return;
      }

      setData(response.data);
      setIsMockMode(Boolean(response.isMock));

      // Save to localStorage history
      const saved = saveSession(prompt, response.data);
      setSavedSessions((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)]);
    } catch (err: any) {
      if (currentId !== requestIdRef.current) {
        console.log(`[CogniCraft Guard] Ignored stale error for request #${currentId}`);
        return;
      }

      console.error('[CogniCraft Execution Error]:', err);
      setError({
        message: err.message || 'An error occurred while parsing or generating the study suite.',
        code: err.code || 'SERVER_ERROR',
        details: err.details,
        rawOutputSnippet: err.rawOutputSnippet,
      });
    } finally {
      if (currentId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefining(false);
      }
    }
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsRefining(false);
  };

  const handleRetry = () => {
    if (activePrompt) {
      handleGenerate(activePrompt);
    }
  };

  const handleLoadWorkingPreset = () => {
    const preset = 'React Hooks & Virtual DOM state management with defensive parsing';
    handleGenerate(preset);
  };

  const handleDeleteSession = (id: string) => {
    const updated = deleteSession(id);
    setSavedSessions(updated);
  };

  return (
    <div className="app-shell">
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        hasApiKey={serverHealth.hasApiKey}
        isMockMode={isMockMode}
      />

      <main className="main-content">
        <div className="content-container">
          {/* Top Prompt Input */}
          <PromptInput onSubmit={(prompt) => handleGenerate(prompt)} isLoading={isLoading} />

          {/* Loading State */}
          {isLoading && <LoadingState onCancel={handleCancelRequest} />}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorState
              error={error}
              onRetry={handleRetry}
              onTryPreset={handleLoadWorkingPreset}
            />
          )}

          {/* Interactive Result View */}
          {data && !isLoading && !error && (
            <ResultView
              data={data}
              onRefine={(refinementPrompt) => handleGenerate(refinementPrompt, true)}
              isRefining={isRefining}
              isMockMode={isMockMode}
            />
          )}
        </div>
      </main>

      {/* Drawer & Help Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={savedSessions}
        onSelectSession={(sess) => {
          setData(sess.data);
          setActivePrompt(sess.prompt);
          setError(null);
        }}
        onDeleteSession={handleDeleteSession}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <footer className="app-footer font-mono">
        <div className="footer-content">
          <span>CogniCraft AI — Frontend Internship Assignment</span>
          <span>Defensive JSON Validation • Key Isolation Proxy • React Hooks</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
