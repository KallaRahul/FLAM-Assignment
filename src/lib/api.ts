import type { StudySessionData, ApiErrorResponse } from '../types/result';
import { validateAndParseResult, ValidationError } from './validateResult';

export interface GenerateOptions {
  prompt: string;
  isRefinement?: boolean;
  currentData?: StudySessionData;
  signal?: AbortSignal;
}

export interface GenerateResultResponse {
  data: StudySessionData;
  isMock?: boolean;
  warning?: string;
}

/**
 * Client-Side Fallback Generator when backend proxy server is offline (e.g. 502 Bad Gateway).
 * Ensures app NEVER breaks even if user runs vite without backend.
 */
function generateClientMockSession(promptText: string, isRefinement = false, currentData?: StudySessionData): StudySessionData {
  const clean = promptText.replace(/\[test-error:[^\]]+\]/g, '').trim() || 'General Learning';
  const titleWords = clean.split(/\s+/).slice(0, 4).join(' ');
  const capitalizedTitle = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);

  const mockData: StudySessionData = {
    title: isRefinement ? `${currentData?.title || 'Study Set'} (Refined)` : `Mastering ${capitalizedTitle}`,
    description: `Interactive study deck and adaptive self-assessment generated for "${clean.slice(0, 60)}...".`,
    estimatedStudyTimeMinutes: 20,
    subjectCategory: clean.toLowerCase().includes('code') || clean.toLowerCase().includes('react') || clean.toLowerCase().includes('js')
      ? 'Software Engineering'
      : clean.toLowerCase().includes('history') || clean.toLowerCase().includes('war')
      ? 'History & Social Studies'
      : clean.toLowerCase().includes('math') || clean.toLowerCase().includes('physics')
      ? 'Mathematics & Physics'
      : 'Core Knowledge',
    flashcards: [
      {
        id: `fc-1-${Date.now()}`,
        question: `What is the primary core concept behind ${capitalizedTitle}?`,
        answer: `${capitalizedTitle} represents a fundamental paradigm designed to streamline execution, enhance clarity, and structure data efficiently.`,
        hint: `Think about the foundational building blocks discussed in the topic.`,
        difficulty: 'easy',
        topicTag: 'Fundamentals'
      },
      {
        id: `fc-2-${Date.now()}`,
        question: `How does defensive parsing protect application state when dealing with ${capitalizedTitle}?`,
        answer: `Defensive parsing validates data contracts at execution runtime boundaries before passing objects to UI components, preventing uncaught exceptions.`,
        hint: `Consider error boundaries and schema validation routines.`,
        difficulty: 'medium',
        topicTag: 'Architecture'
      },
      {
        id: `fc-3-${Date.now()}`,
        question: `What are common failure modes associated with ${capitalizedTitle} in high-throughput systems?`,
        answer: `Common issues include malformed payload shapes, race conditions from asynchronous responses, unhandled network timeouts, and stale state overwrites.`,
        hint: `Recall asynchronous request lifecycle handling.`,
        difficulty: 'hard',
        topicTag: 'Reliability'
      },
      {
        id: `fc-4-${Date.now()}`,
        question: `Why is state immutability critical when updating UI collections in React?`,
        answer: `Immutability ensures predictable shallow reference updates, triggering efficient re-renders and preventing direct mutation side-effects.`,
        hint: `Think about React's virtual DOM reconciliation process.`,
        difficulty: 'medium',
        topicTag: 'State Management'
      },
      {
        id: `fc-5-${Date.now()}`,
        question: `How can refinement loops improve user experience when working with AI tools?`,
        answer: `Refinement loops allow iterative contextual modifications without losing previously verified structured state or forcing complete re-generations.`,
        hint: `Focus on delta updates and follow-up prompts.`,
        difficulty: 'medium',
        topicTag: 'AI Integration'
      }
    ],
    quiz: [
      {
        id: `q-1-${Date.now()}`,
        question: `Which of the following is the MOST reliable approach to handle unpredictable LLM JSON responses?`,
        options: [
          `Cast the raw output directly to your TypeScript interface without validation`,
          `Validate the JSON schema defensively before passing parsed objects to UI components`,
          `Wrap every single component render in an empty try-catch block and ignore errors`,
          `Assume the LLM will always return 100% compliant schema formatting`
        ],
        correctIndex: 1,
        explanation: `Validating the output schema defensively at runtime guarantees structural contract adherence and isolates malformed payloads before they reach UI components.`,
        conceptTag: 'Defensive Data Handling'
      },
      {
        id: `q-2-${Date.now()}`,
        question: `How do you prevent a slow network response from overwriting a newer user prompt result?`,
        options: [
          `Disable all subsequent user inputs until the server responds`,
          `Track request IDs with a ref or abort pending fetch signals when a new request begins`,
          `Reload the browser page every time the user submits a new prompt`,
          `Increase the server HTTP timeout duration to 60 seconds`
        ],
        correctIndex: 1,
        explanation: `Using a request counter ref or AbortController lets you ignore stale resolving promises if a newer request has already been dispatched.`,
        conceptTag: 'Async Race Conditions'
      },
      {
        id: `q-3-${Date.now()}`,
        question: `What is the primary benefit of routing LLM API requests through a backend server instead of calling from the browser?`,
        options: [
          `It speeds up internet connection speeds for the client browser`,
          `It keeps sensitive API keys hidden from client-side bundle exposure and network tabs`,
          `It automatically converts HTML into PDF files`,
          `It eliminates the need for any CSS styling in the web application`
        ],
        correctIndex: 1,
        explanation: `Routing requests through a backend proxy prevents client-side API key leaks in browser developer tools or source code bundles.`,
        conceptTag: 'Security Best Practices'
      },
      {
        id: `q-4-${Date.now()}`,
        question: `In a flashcard study workflow, what does the "re-test wrong answers" feature primarily facilitate?`,
        options: [
          `Randomizing the color of the application background`,
          `Targeted spaced repetition and active recall focusing on unmastered concepts`,
          `Deleting the user's saved session from browser storage`,
          `Forcing the AI to regenerate the entire study deck from scratch`
        ],
        correctIndex: 1,
        explanation: `Re-testing missed questions leverages active recall principles by isolating weak knowledge spots until mastery is achieved.`,
        conceptTag: 'Pedagogical Design'
      }
    ],
    summary: [
      {
        id: 'sum-1',
        topic: 'Architectural Contract & Validation',
        points: [
          'Always parse raw string responses inside try-catch blocks.',
          'Verify array types, non-null values, and expected properties before rendering.',
          'Route validation failures to custom error fallback states with retry options.'
        ],
        iconType: 'concept'
      },
      {
        id: 'sum-2',
        topic: 'Security & Key Protection',
        points: [
          'Never expose LLM API credentials in client-side bundles or frontend environment files.',
          'Use backend server proxies or serverless functions to authenticate upstream requests.'
        ],
        iconType: 'warning'
      },
      {
        id: 'sum-3',
        topic: 'User Experience & Resilience',
        points: [
          'Provide feedback during generation with progress indicators.',
          'Support refinement loops to allow follow-up edits without starting over.',
          'Persist sessions locally to prevent user data loss across page reloads.'
        ],
        iconType: 'tip'
      }
    ],
    mindMap: [
      { id: 'node-1', label: capitalizedTitle, description: 'Core Topic Focus', parentId: null, category: 'Root' },
      { id: 'node-2', label: 'Data Architecture', description: 'Defensive validation & type safety', parentId: 'node-1', category: 'Core' },
      { id: 'node-3', label: 'Backend Proxy', description: 'API Key isolation & request routing', parentId: 'node-1', category: 'Security' },
      { id: 'node-4', label: 'Interactive UI', description: 'Flashcards, Quizzes, & Mindmaps', parentId: 'node-1', category: 'Frontend' },
      { id: 'node-5', label: 'Schema Validator', description: 'Runtime contract verification', parentId: 'node-2', category: 'Validation' },
      { id: 'node-6', label: 'Refinement Engine', description: 'Iterative follow-up enhancements', parentId: 'node-4', category: 'Interactive' }
    ],
    generatedAt: new Date().toISOString(),
  };

  if (isRefinement && currentData) {
    mockData.flashcards = [
      ...currentData.flashcards,
      {
        id: `fc-ref-${Date.now()}`,
        question: `[Refined] How does "${promptText.slice(0, 30)}" enhance our understanding of ${currentData.title}?`,
        answer: `This refinement adds targeted depth, addressing specific edge cases and expanding application scope.`,
        hint: `Focus on the newly requested focus area.`,
        difficulty: 'hard',
        topicTag: 'Refinement Specialization'
      }
    ];
    mockData.quiz = [
      ...currentData.quiz,
      {
        id: `q-ref-${Date.now()}`,
        question: `[Refined Question] Regarding "${promptText.slice(0, 35)}", which statement is true?`,
        options: [
          `It expands on existing concepts by providing tailored diagnostic insights`,
          `It causes the application to crash immediately`,
          `It disables all flashcard flipping functionality`,
          `It converts the study app into a basic chat box`
        ],
        correctIndex: 0,
        explanation: `Refinement requests seamlessly extend existing structured study collections.`,
        conceptTag: 'Refinement'
      }
    ];
    mockData.summary = currentData.summary;
    mockData.mindMap = [
      ...currentData.mindMap,
      { id: `node-ref-${Date.now()}`, label: `Refinement: ${promptText.slice(0, 20)}`, description: 'Newly appended branch from follow-up prompt', parentId: 'node-1', category: 'Refinement' }
    ];
  }

  return mockData;
}

/**
 * Sends prompt to backend Express server proxy (/api/generate).
 * Never communicates directly with LLM API from browser context.
 * Features automatic fallback if server is offline or returning 502.
 */
export async function generateStudySession(options: GenerateOptions): Promise<GenerateResultResponse> {
  const { prompt, isRefinement = false, currentData, signal } = options;

  // Handle explicit diagnostic test flags directly if present
  if (prompt.includes('[test-error:500]')) {
    throw new ValidationError(
      'Server responded with HTTP status 500',
      'SERVER_ERROR',
      'Simulated 500 Internal Server Error triggered by [test-error:500] flag.'
    );
  }

  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        isRefinement,
        currentData,
      }),
      signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ValidationError(
        'Request was cancelled by a newer prompt.',
        'NETWORK_ERROR',
        'A new prompt was submitted before the previous request completed.'
      );
    }
    // Fallback to client mock generator if backend proxy unreachable
    console.warn('[CogniCraft API] Backend server unreachable. Using client-side fallback generator.');
    const fallbackData = generateClientMockSession(prompt, isRefinement, currentData);
    return {
      data: fallbackData,
      isMock: true,
      warning: 'Backend server proxy offline. Generated via client fallback generator.'
    };
  }

  if (!response.ok) {
    // If Vite proxy returns 502/503 (server down), fallback gracefully!
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      console.warn(`[CogniCraft API] Proxy returned HTTP ${response.status}. Using client fallback generator.`);
      const fallbackData = generateClientMockSession(prompt, isRefinement, currentData);
      return {
        data: fallbackData,
        isMock: true,
        warning: `Backend proxy returned HTTP ${response.status}. Used client fallback generator.`
      };
    }

    let errorJson: ApiErrorResponse | null = null;
    try {
      errorJson = await response.json();
    } catch {
      // Body not JSON
    }

    const code = errorJson?.code || 'SERVER_ERROR';
    const message = errorJson?.error || `Server responded with HTTP status ${response.status}`;
    throw new ValidationError(message, code, errorJson?.details);
  }

  const payload = await response.json();

  if (!payload.success) {
    throw new ValidationError(
      payload.error || 'Backend processing failed.',
      payload.code || 'SERVER_ERROR',
      payload.details
    );
  }

  // Pass raw string to defensive parser validator
  const validatedData = validateAndParseResult(payload.data);

  return {
    data: validatedData,
    isMock: payload.isMock,
    warning: payload.warning,
  };
}

/**
 * Check backend health status
 */
export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'offline', hasApiKey: false };
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false };
  }
}
