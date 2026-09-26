import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Flashcard } from '../types/result';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Star, CheckCircle, Shuffle, HelpCircle } from 'lucide-react';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Interactive deck state
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked' | 'unmastered'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [shuffledCards, setShuffledCards] = useState<Flashcard[] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Derive active cards using useMemo
  const activeCards = useMemo(() => {
    let list = shuffledCards ? [...shuffledCards] : [...cards];

    if (filterMode === 'bookmarked') {
      list = list.filter((c) => bookmarkedIds.has(c.id));
    } else if (filterMode === 'unmastered') {
      list = list.filter((c) => !masteredIds.has(c.id));
    }

    if (difficultyFilter !== 'all') {
      list = list.filter((c) => c.difficulty.toLowerCase() === difficultyFilter);
    }

    return list;
  }, [cards, shuffledCards, filterMode, difficultyFilter, bookmarkedIds, masteredIds]);

  const currentCard = activeCards[currentIndex];

  const handleNext = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  }, [activeCards.length]);

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMastered = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shuffleDeck = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Text to Speech
  const speakCurrentCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window) || !currentCard) return;

    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = isFlipped ? currentCard.answer : currentCard.question;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (cards.length === 0) {
    return <div className="empty-deck">No flashcards available in this study set.</div>;
  }

  return (
    <div className="flashcard-module">
      {/* Controls & Filter Bar */}
      <div className="deck-toolbar">
        <div className="filter-chips">
          <button
            onClick={() => setFilterMode('all')}
            className={`deck-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
          >
            All Cards ({cards.length})
          </button>

          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`deck-filter-btn ${filterMode === 'bookmarked' ? 'active' : ''}`}
          >
            <Star className="w-3.5 h-3.5 fill-current text-amber-400" /> Bookmarked ({bookmarkedIds.size})
          </button>

          <button
            onClick={() => setFilterMode('unmastered')}
            className={`deck-filter-btn ${filterMode === 'unmastered' ? 'active' : ''}`}
          >
            Unmastered ({cards.length - masteredIds.size})
          </button>
        </div>

        <div className="deck-meta-actions">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="difficulty-select"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button onClick={shuffleDeck} className="icon-action-btn" title="Shuffle Deck">
            <Shuffle className="w-4 h-4" /> Shuffle
          </button>
        </div>
      </div>

      {/* Empty Filter State */}
      {activeCards.length === 0 ? (
        <div className="empty-filter-state">
          <p>No cards match the active filters.</p>
          <button onClick={() => { setFilterMode('all'); setDifficultyFilter('all'); }} className="reset-filter-btn">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Card Counter & Progress Indicator */}
          <div className="deck-progress-bar">
            <div className="deck-progress-track">
              <div
                className="deck-progress-fill"
                style={{ width: `${((currentIndex + 1) / activeCards.length) * 100}%` }}
              />
            </div>
            <div className="deck-progress-text font-mono">
              Card {currentIndex + 1} of {activeCards.length}
            </div>
          </div>

          {/* 3D Flip Card */}
          <div className="card-container" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
              
              {/* FRONT SIDE (Question) */}
              <div className="flip-card-front">
                <div className="card-header-bar">
                  <div className="card-badges">
                    <span className={`diff-badge diff-${currentCard.difficulty}`}>
                      {currentCard.difficulty.toUpperCase()}
                    </span>
                    <span className="topic-badge">{currentCard.topicTag}</span>
                  </div>

                  <div className="card-top-actions">
                    <button
                      onClick={(e) => speakCurrentCard(e)}
                      className={`card-icon-btn ${isSpeaking ? 'speaking' : ''}`}
                      title="Read Question Aloud"
                      aria-label="Read Question Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => toggleBookmark(e, currentCard.id)}
                      className={`card-icon-btn ${bookmarkedIds.has(currentCard.id) ? 'bookmarked' : ''}`}
                      title={bookmarkedIds.has(currentCard.id) ? 'Remove Bookmark' : 'Bookmark Card'}
                      aria-label="Bookmark"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <span className="card-side-label">QUESTION</span>
                  <h3 className="card-question-text">{currentCard.question}</h3>
                </div>

                <div className="card-footer-bar">
                  {currentCard.hint && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                      className="hint-btn"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  )}

                  <span className="flip-prompt">
                    <RotateCcw className="w-3.5 h-3.5" /> Click or press <kbd className="shortcut-key">Space</kbd> to flip
                  </span>
                </div>

                {showHint && currentCard.hint && (
                  <div className="hint-overlay" onClick={(e) => e.stopPropagation()}>
                    💡 <strong>Hint:</strong> {currentCard.hint}
                  </div>
                )}
              </div>

              {/* BACK SIDE (Answer) */}
              <div className="flip-card-back">
                <div className="card-header-bar">
                  <div className="card-badges">
                    <span className="answer-badge font-mono">ANSWER & EXPLANATION</span>
                  </div>

                  <div className="card-top-actions">
                    <button
                      onClick={(e) => speakCurrentCard(e)}
                      className={`card-icon-btn ${isSpeaking ? 'speaking' : ''}`}
                      title="Read Answer Aloud"
                      aria-label="Read Answer Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => toggleMastered(e, currentCard.id)}
                      className={`mastered-toggle-btn ${masteredIds.has(currentCard.id) ? 'mastered' : ''}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{masteredIds.has(currentCard.id) ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <p className="card-answer-text">{currentCard.answer}</p>
                </div>

                <div className="card-footer-bar">
                  <span className="flip-prompt">
                    <RotateCcw className="w-3.5 h-3.5" /> Click to flip back
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="deck-navigation">
            <button
              onClick={handlePrev}
              className="nav-arrow-btn"
              title="Previous Card (Left Arrow)"
              aria-label="Previous Card"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Prev</span>
            </button>

            <span className="nav-keyboard-hint">
              Use <kbd className="shortcut-key">←</kbd> <kbd className="shortcut-key">→</kbd> keys
            </span>

            <button
              onClick={handleNext}
              className="nav-arrow-btn"
              title="Next Card (Right Arrow)"
              aria-label="Next Card"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
