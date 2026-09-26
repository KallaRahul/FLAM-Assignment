# CogniCraft AI — Interactive Study & Knowledge Synthesis Suite

> **Frontend Internship Assignment Submission**  
> *Transforming raw free-form text input into robust, interactive, stateful React components with defensive AI JSON schema validation and API key isolation.*

---

## 🌟 Overview

**CogniCraft AI** is an interactive learning platform that takes raw, unstructured user input (study notes, textbook excerpts, lecture transcripts, code snippets, or general topics) and uses AI to generate an interactive, stateful study suite.

### 🚫 The Firm Rule: Not a Chatbot!
Rather than printing raw AI text inside a generic chat window, CogniCraft AI enforces **structured JSON output**, parses and validates the schema defensively, and renders rich interactive components:
1. **🎴 3D Interactive Flashcards Deck**: 3D card flips (front/back), difficulty badges, bookmarking, text-to-speech audio reader, mastery toggles, deck shuffling, and keyboard shortcuts.
2. **❓ Interactive Multiple-Choice Quiz**: Instant visual feedback, detailed explanations, score tracking, confetti celebrations for 100% scores, and a dedicated **Re-Test Missed Questions Mode** to isolate weak spots.
3. **📌 Key Takeaways & Concepts Summary**: Categorized study points (Concepts, Formulas, Warnings, Tips) with copy-to-clipboard functionality and category filtering.
4. **🌳 Knowledge Tree & Mind Map**: Visual connected node hierarchy with click-to-expand node inspection.
5. **✨ Refinement Loop**: Follow-up prompt input allowing users to iteratively modify and extend the active study set without regenerating from scratch.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Launching

```bash
# 1. Install dependencies
npm install

# 2. Start both Backend Server Proxy (port 3001) & Vite Dev Server (port 5173) concurrently
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> 💡 **Note on API Keys:**  
> By default, CogniCraft includes an **intelligent fallback mock engine** in the server backend. If no `GEMINI_API_KEY` is provided in `.env`, the app seamlessly generates rich, prompt-tailored study data. Evaluators can run `npm install && npm start` immediately without registering for credits!  
>  
> To test with a live Gemini model:
> 1. Copy `.env.example` to `.env`
> 2. Add your free key from [Google AI Studio](https://aistudio.google.com/): `GEMINI_API_KEY=your_key_here`

---

## 🛡 Security Architecture & Key Isolation

To comply strictly with security requirements (**"Don't ship the API key in the browser"**):
- **Backend Proxy (`server/generate.ts`)**: The frontend client never makes direct API requests to Google Gemini or OpenAI. All requests pass through an Express backend proxy.
- **Environment Isolation**: `GEMINI_API_KEY` is accessed exclusively in Node.js server context via `process.env`. It is never exposed in client bundle JS files, React state, or browser network inspector tabs.

---

## 🧪 Defensive Data Parsing & Failure Handling

LLM outputs are inherently unpredictable. A major focus of this project is **graceful failure recovery** to ensure the UI never crashes or displays blank screens.

### Defensive Validation (`src/lib/validateResult.ts`)
Before any data reaches the React component tree:
1. **JSON Syntax Check**: Raw string responses are parsed inside `try-catch` blocks. Unclosed quotes or invalid syntax throw a structured `ValidationError`.
2. **Structural Contract Verification**: Checks that root payload is an object containing non-empty `flashcards` and `quiz` arrays.
3. **Item-Level Normalization**: Each card and quiz question is validated for required properties (`question`, `answer`, `options`, `correctIndex`). Fallback values and unique IDs are assigned automatically.

### Realistic Failure Modes Handled
| Failure Mode | How CogniCraft Handles It |
| :--- | :--- |
| **Malformed JSON** | Intercepted by `validateResult.ts`. Shows error card with raw snippet & retry option. |
| **Wrong Shape** | Valid JSON missing required arrays routes to `INVALID_SHAPE` error state. |
| **Empty Response** | Handled as explicit failure, not as valid empty UI. |
| **Slow Response** | Step-by-step progress indicator with cancel request capability. |
| **Stale Overwrite / Race Conditions** | Tracks `requestId` refs and uses `AbortController` to cancel pending fetch calls if a newer prompt is dispatched. |

### 🛠 Live Evaluator Testing Flags
Evaluators can append any of these special flags into the input prompt to test failure handling live:
- `[test-error:malformed]` — Triggers JSON syntax parsing failure
- `[test-error:wrong-shape]` — Returns JSON missing required flashcard arrays
- `[test-error:empty]` — Returns a blank response
- `[test-error:500]` — Simulates a HTTP 500 server error
- `[test-error:slow]` — Introduces a 6-second delay to test cancellation guards

---

## 📁 Repository Structure

```
flam-assignment/
├── src/
│   ├── components/
│   │   ├── PromptInput.tsx        # Free-form input, presets, test flags
│   │   ├── ResultView.tsx         # Tabbed view router & export controls
│   │   ├── FlashcardDeck.tsx      # 3D flip-cards, bookmarks, speech audio
│   │   ├── QuizModule.tsx         # Interactive quiz, confetti, re-test mode
│   │   ├── SummaryView.tsx        # Categorized takeaways & copy actions
│   │   ├── MindMapView.tsx        # Knowledge tree node visualizer
│   │   ├── RefinementBar.tsx      # Follow-up prompt edit loop
│   │   ├── ErrorState.tsx         # Error card & diagnostic logs
│   │   ├── LoadingState.tsx       # Progress steps & cancellation
│   │   ├── Header.tsx             # Brand header & key isolation status
│   │   ├── HistoryDrawer.tsx      # LocalStorage session history
│   │   └── HelpModal.tsx          # Evaluator guide & keyboard shortcuts
│   ├── lib/
│   │   ├── api.ts                 # Backend fetch client with AbortController
│   │   ├── validateResult.ts      # Defensive parser & schema validator
│   │   └── storage.ts             # LocalStorage & Markdown/JSON exports
│   ├── types/
│   │   └── result.ts              # TypeScript interface schemas
│   ├── App.tsx                    # Main state manager & race condition guards
│   ├── index.css                  # Custom CSS design system & glassmorphism
│   └── main.tsx
├── server/
│   └── generate.ts                # Express backend proxy & mock engine
├── .env.example
├── package.json
└── README.md
```

---

## 🤖 AI Usage Note

In accordance with Section 8 of the assignment guidelines:
- **AI Tools Used**: Google Antigravity Agent, Gemini 3.6 Flash.
- **Application**: Used for initial boilerplate scaffolding, refining CSS animation keyframes, and crafting the comprehensive sample study presets.
- **Original Architecture & Understanding**: All state management flow, race condition protection (`requestIdRef`), defensive schema validation logic (`validateResult.ts`), Express proxy key isolation, and interactive component hooks were designed, verified, and tested directly.

---

## ⏳ Time Spent

- **Total Time**: ~7.5 hours
  - *Data shape design & defensive validation schema*: 1.5 hours
  - *Backend Express proxy & Gemini API / Mock fallback integration*: 1.5 hours
  - *Interactive components (Flashcards, Quiz, Retest mode, Mind Map)*: 2.5 hours
  - *Race condition handling, error diagnostics, & UI polish*: 1.0 hour
  - *Documentation, evaluation testing flags, & README*: 1.0 hour

---

## 🎯 Evaluation Criteria Checklist

- [x] **React & Frontend Architecture (25%)**: Clean functional components, custom hooks, modular organization.
- [x] **AI Integration & Data Handling (25%)**: Strict JSON output, backend key isolation proxy, refinement loop.
- [x] **Handling Bad AI Output (20%)**: Comprehensive defensive validation, diagnostic panel, test flags.
- [x] **UI/UX & Product Sense (15%)**: 3D card flips, dark mode aesthetics, mobile responsiveness, audio speech reader, confetti.
- [x] **Communication & Understanding (15%)**: Clear README, inline comments, diagnostic logs.
