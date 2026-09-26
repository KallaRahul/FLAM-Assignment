import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../types/result';
import { CheckCircle2, XCircle, Trophy, RotateCcw, AlertCircle, ArrowRight, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModuleProps {
  quiz: QuizQuestion[];
}

export const QuizModule: React.FC<QuizModuleProps> = ({ quiz: initialQuiz }) => {
  const [retestQuestions, setRetestQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isRetesting, setIsRetesting] = useState(false);

  const activeQuiz = retestQuestions || initialQuiz;
  const currentQuestion = activeQuiz[currentIndex];

  const handleSelectOption = useCallback((index: number) => {
    if (selectedOption !== null) return; // Answer already chosen for this question
    setSelectedOption(index);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: index }));
  }, [selectedOption, currentIndex]);

  const calculateScore = useCallback((): number => {
    let score = 0;
    activeQuiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  }, [activeQuiz, userAnswers]);

  const handleNextQuestion = () => {
    if (currentIndex < activeQuiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(userAnswers[currentIndex + 1] ?? null);
    } else {
      setIsFinished(true);
      // Trigger confetti if score is high
      const correctCount = calculateScore();
      if (correctCount === activeQuiz.length) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const resetQuiz = () => {
    setRetestQuestions(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setIsFinished(false);
    setIsRetesting(false);
  };

  // RE-TEST WRONG ANSWERS MODE
  const startRetestMissed = () => {
    const missed = activeQuiz.filter((q, idx) => userAnswers[idx] !== q.correctIndex);
    if (missed.length === 0) return;

    setRetestQuestions(missed);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setIsFinished(false);
    setIsRetesting(true);
  };

  // Keyboard controls for options 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || selectedOption !== null) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQuestion && idx < currentQuestion.options.length) {
          handleSelectOption(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, selectedOption, isFinished, currentQuestion, handleSelectOption]);

  if (activeQuiz.length === 0) {
    return <div className="empty-quiz">No quiz questions available.</div>;
  }

  // QUIZ RESULTS SCREEN
  if (isFinished) {
    const score = calculateScore();
    const total = activeQuiz.length;
    const percentage = Math.round((score / total) * 100);
    const missedCount = total - score;

    return (
      <div className="quiz-result-card">
        <div className="result-header">
          <div className="trophy-wrap">
            {percentage >= 80 ? (
              <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            ) : (
              <Award className="w-12 h-12 text-indigo-400" />
            )}
          </div>
          <h2 className="result-title">
            {isRetesting ? 'Re-Test Complete!' : 'Quiz Evaluation Complete!'}
          </h2>
          <p className="result-subtitle">
            {percentage === 100
              ? '🎉 Outstanding! You mastered every concept in this quiz!'
              : percentage >= 70
              ? 'Great performance! Review the explanations below to polish weak spots.'
              : 'Keep practicing! Use the re-test mode to target missed questions.'}
          </p>
        </div>

        {/* Score Ring / Stats */}
        <div className="result-stats-row">
          <div className="stat-box">
            <span className="stat-value font-mono">{score} / {total}</span>
            <span className="stat-label">Correct Answers</span>
          </div>
          <div className="stat-box">
            <span className={`stat-value font-mono ${percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {percentage}%
            </span>
            <span className="stat-label">Mastery Score</span>
          </div>
          <div className="stat-box">
            <span className="stat-value font-mono text-rose-400">{missedCount}</span>
            <span className="stat-label">Needs Practice</span>
          </div>
        </div>

        {/* Review Breakdown */}
        <div className="review-list font-sans">
          <h3 className="review-heading">Question Review Breakdown:</h3>
          {activeQuiz.map((q, idx) => {
            const chosen = userAnswers[idx];
            const isCorrect = chosen === q.correctIndex;

            return (
              <div key={q.id} className={`review-item ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
                <div className="review-item-header">
                  <span className="review-q-num">Q{idx + 1}</span>
                  <span className="review-q-text">{q.question}</span>
                  {isCorrect ? (
                    <span className="badge-pass">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="badge-fail">
                      <XCircle className="w-3.5 h-3.5" /> Missed
                    </span>
                  )}
                </div>

                <div className="review-explanation">
                  <div className="explanation-text">
                    <strong>Correct Choice:</strong> {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                  </div>
                  <div className="explanation-text text-slate-300">
                    💡 <em>{q.explanation}</em>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          {missedCount > 0 && (
            <button onClick={startRetestMissed} className="retest-btn">
              <RotateCcw className="w-4 h-4" />
              <span>Re-Test {missedCount} Missed Question{missedCount > 1 ? 's' : ''}</span>
            </button>
          )}

          <button onClick={resetQuiz} className="restart-btn">
            <Sparkles className="w-4 h-4" />
            <span>Retake Full Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ QUESTION SCREEN
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQuestion.correctIndex;

  return (
    <div className="quiz-card">
      {/* Header & Progress */}
      <div className="quiz-header font-sans">
        <div className="quiz-meta-row">
          <span className="quiz-category-tag">{currentQuestion.conceptTag}</span>
          {isRetesting && <span className="retest-badge">Targeted Re-Test Mode</span>}
          <span className="quiz-progress-text font-mono">
            Question {currentIndex + 1} of {activeQuiz.length}
          </span>
        </div>

        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currentIndex + 1) / activeQuiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Body */}
      <div className="quiz-body">
        <h3 className="quiz-question-title">{currentQuestion.question}</h3>

        {/* Options Grid */}
        <div className="options-grid">
          {currentQuestion.options.map((opt, oIdx) => {
            const isSelected = selectedOption === oIdx;
            const isTargetCorrect = isAnswered && oIdx === currentQuestion.correctIndex;
            const isTargetWrong = isAnswered && isSelected && !isCorrect;

            let optionClass = 'option-btn';
            if (isAnswered) {
              if (isTargetCorrect) optionClass += ' option-correct';
              else if (isTargetWrong) optionClass += ' option-wrong';
              else optionClass += ' option-dimmed';
            }

            return (
              <button
                key={oIdx}
                onClick={() => handleSelectOption(oIdx)}
                disabled={isAnswered}
                className={optionClass}
              >
                <span className="option-letter font-mono">{String.fromCharCode(65 + oIdx)}</span>
                <span className="option-text">{opt}</span>
                {isTargetCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
                {isTargetWrong && <XCircle className="w-5 h-5 text-rose-400 ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Instant Answer Explanation Banner */}
        {isAnswered && (
          <div className={`explanation-banner ${isCorrect ? 'banner-correct' : 'banner-wrong'}`}>
            <div className="banner-title">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Correct Answer!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>Incorrect. The correct answer was {String.fromCharCode(65 + currentQuestion.correctIndex)}.</span>
                </>
              )}
            </div>
            <p className="banner-explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Next Button Footer */}
        <div className="quiz-footer">
          <span className="shortcut-tip font-mono">
            Key shortcuts: Press <kbd className="shortcut-key">1</kbd>-<kbd className="shortcut-key">4</kbd> to pick answers
          </span>

          <button
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            className="quiz-next-btn"
          >
            <span>{currentIndex === activeQuiz.length - 1 ? 'View Final Results' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
