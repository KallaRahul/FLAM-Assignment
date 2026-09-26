import type { StudySessionData, ApiErrorResponse, Flashcard, QuizQuestion, SummaryPoint, MindMapNode } from '../types/result';

export class ValidationError extends Error {
  code: ApiErrorResponse['code'];
  details?: string;
  rawOutputSnippet?: string;

  constructor(message: string, code: ApiErrorResponse['code'], details?: string, rawOutputSnippet?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
    this.rawOutputSnippet = rawOutputSnippet;
  }
}

/**
 * Validates and sanitizes raw LLM output into a clean, safe StudySessionData object.
 * Rejects malformed JSON, wrong shapes, or empty responses explicitly.
 */
export function validateAndParseResult(rawResponse: string): StudySessionData {
  if (!rawResponse || typeof rawResponse !== 'string' || !rawResponse.trim()) {
    throw new ValidationError(
      'The model returned an empty response.',
      'EMPTY_RESPONSE',
      'The raw output received from the server was blank or null.'
    );
  }

  const trimmed = rawResponse.trim();
  let parsed: unknown;

  // 1. Attempt JSON parsing
  try {
    // Strip markdown code fences if model accidentally wrapped output in ```json ... ```
    const cleaned = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new ValidationError(
      'Failed to parse AI output as valid JSON.',
      'MALFORMED_JSON',
      `SyntaxError: ${errorMsg}`,
      trimmed.slice(0, 300)
    );
  }

  // 2. Validate Root Structure
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ValidationError(
      'AI response root is not a valid JSON object.',
      'INVALID_SHAPE',
      `Expected a root JSON object, got ${Array.isArray(parsed) ? 'Array' : typeof parsed}.`,
      trimmed.slice(0, 300)
    );
  }

  const data = parsed as Record<string, unknown>;

  // 3. Validate Flashcards (Required Array)
  if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
    throw new ValidationError(
      'Missing or empty "flashcards" array in AI output.',
      'INVALID_SHAPE',
      'The model did not generate any valid flashcards.',
      trimmed.slice(0, 300)
    );
  }

  const validFlashcards: Flashcard[] = [];
  for (let i = 0; i < data.flashcards.length; i++) {
    const card = data.flashcards[i];
    if (typeof card === 'object' && card !== null) {
      const c = card as Record<string, unknown>;
      if (typeof c.question === 'string' && c.question.trim() && typeof c.answer === 'string' && c.answer.trim()) {
        validFlashcards.push({
          id: typeof c.id === 'string' && c.id ? c.id : `fc-${i + 1}-${Math.random().toString(36).substring(2, 7)}`,
          question: c.question.trim(),
          answer: c.answer.trim(),
          hint: typeof c.hint === 'string' ? c.hint.trim() : undefined,
          difficulty: (['easy', 'medium', 'hard'].includes(String(c.difficulty).toLowerCase())
            ? String(c.difficulty).toLowerCase()
            : 'medium') as 'easy' | 'medium' | 'hard',
          topicTag: typeof c.topicTag === 'string' && c.topicTag.trim() ? c.topicTag.trim() : 'General',
        });
      }
    }
  }

  if (validFlashcards.length === 0) {
    throw new ValidationError(
      'Flashcards contained malformed items missing "question" or "answer".',
      'INVALID_SHAPE',
      'None of the returned flashcard items matched the required structural contract.',
      trimmed.slice(0, 300)
    );
  }

  // 4. Validate Quiz Questions (Required Array)
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    throw new ValidationError(
      'Missing or empty "quiz" array in AI output.',
      'INVALID_SHAPE',
      'The model did not generate any quiz questions.',
      trimmed.slice(0, 300)
    );
  }

  const validQuiz: QuizQuestion[] = [];
  for (let i = 0; i < data.quiz.length; i++) {
    const q = data.quiz[i];
    if (typeof q === 'object' && q !== null) {
      const item = q as Record<string, unknown>;
      const question = typeof item.question === 'string' ? item.question.trim() : '';
      const options = Array.isArray(item.options) ? item.options.map((o) => String(o).trim()).filter(Boolean) : [];
      let correctIndex = typeof item.correctIndex === 'number' ? Math.floor(item.correctIndex) : 0;
      const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : 'Correct answer based on key study concepts.';

      if (question && options.length >= 2) {
        if (correctIndex < 0 || correctIndex >= options.length) {
          correctIndex = 0; // Safe fallback
        }

        validQuiz.push({
          id: typeof item.id === 'string' && item.id ? item.id : `quiz-${i + 1}-${Math.random().toString(36).substring(2, 7)}`,
          question,
          options,
          correctIndex,
          explanation,
          conceptTag: typeof item.conceptTag === 'string' && item.conceptTag.trim() ? item.conceptTag.trim() : 'Key Concept',
        });
      }
    }
  }

  if (validQuiz.length === 0) {
    throw new ValidationError(
      'Quiz items were missing valid "question" or "options" arrays.',
      'INVALID_SHAPE',
      'Could not validate any complete quiz questions from model response.',
      trimmed.slice(0, 300)
    );
  }

  // 5. Validate Summary Points (Optional / Array fallback)
  const validSummary: SummaryPoint[] = [];
  if (Array.isArray(data.summary)) {
    for (let i = 0; i < data.summary.length; i++) {
      const s = data.summary[i];
      if (typeof s === 'object' && s !== null) {
        const item = s as Record<string, unknown>;
        const topic = typeof item.topic === 'string' ? item.topic.trim() : `Key Concept ${i + 1}`;
        const points = Array.isArray(item.points) ? item.points.map((p) => String(p).trim()).filter(Boolean) : [];
        const rawIcon = String(item.iconType).toLowerCase();
        const iconType = (['concept', 'formula', 'warning', 'tip'].includes(rawIcon) ? rawIcon : 'concept') as SummaryPoint['iconType'];

        if (topic && points.length > 0) {
          validSummary.push({
            id: typeof item.id === 'string' && item.id ? item.id : `sum-${i + 1}`,
            topic,
            points,
            iconType,
          });
        }
      }
    }
  }

  // 6. Validate MindMap (Optional / Array fallback)
  const validMindMap: MindMapNode[] = [];
  if (Array.isArray(data.mindMap)) {
    for (let i = 0; i < data.mindMap.length; i++) {
      const m = data.mindMap[i];
      if (typeof m === 'object' && m !== null) {
        const item = m as Record<string, unknown>;
        const label = typeof item.label === 'string' ? item.label.trim() : '';
        const description = typeof item.description === 'string' ? item.description.trim() : '';
        if (label) {
          validMindMap.push({
            id: typeof item.id === 'string' && item.id ? item.id : `node-${i + 1}`,
            label,
            description,
            parentId: typeof item.parentId === 'string' ? item.parentId : null,
            category: typeof item.category === 'string' ? item.category : 'General',
          });
        }
      }
    }
  }

  // Final Object Construction
  return {
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Interactive Study Suite',
    description: typeof data.description === 'string' && data.description.trim() ? data.description.trim() : 'AI-generated study materials and self-assessment tools.',
    estimatedStudyTimeMinutes: typeof data.estimatedStudyTimeMinutes === 'number' ? Math.max(1, Math.round(data.estimatedStudyTimeMinutes)) : 15,
    subjectCategory: typeof data.subjectCategory === 'string' && data.subjectCategory.trim() ? data.subjectCategory.trim() : 'General Knowledge',
    flashcards: validFlashcards,
    quiz: validQuiz,
    summary: validSummary,
    mindMap: validMindMap,
    generatedAt: new Date().toISOString(),
  };
}
