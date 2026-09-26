export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTag: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
}

export interface SummaryPoint {
  id: string;
  topic: string;
  points: string[];
  iconType: 'concept' | 'formula' | 'warning' | 'tip';
}

export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  parentId?: string | null;
  category?: string;
}

export interface StudySessionData {
  title: string;
  description: string;
  estimatedStudyTimeMinutes: number;
  subjectCategory: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  summary: SummaryPoint[];
  mindMap: MindMapNode[];
  generatedAt: string;
}

export interface RefinementPayload {
  currentData: StudySessionData;
  refinementPrompt: string;
}

export interface ApiErrorResponse {
  error: string;
  code: 'MALFORMED_JSON' | 'INVALID_SHAPE' | 'EMPTY_RESPONSE' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'NETWORK_ERROR';
  details?: string;
  rawOutputSnippet?: string;
}

export interface SavedSession {
  id: string;
  createdAt: string;
  prompt: string;
  data: StudySessionData;
}
