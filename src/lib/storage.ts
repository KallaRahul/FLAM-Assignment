import type { SavedSession, StudySessionData } from '../types/result';

const STORAGE_KEY = 'cognicraft_saved_sessions_v1';

export function getSavedSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved sessions from localStorage:', err);
    return [];
  }
}

export function saveSession(prompt: string, data: StudySessionData): SavedSession {
  const existing = getSavedSessions();
  const newSession: SavedSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    prompt,
    data,
  };

  const updated = [newSession, ...existing.slice(0, 19)]; // Keep latest 20
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
  return newSession;
}

export function deleteSession(id: string): SavedSession[] {
  const existing = getSavedSessions();
  const updated = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete session:', err);
  }
  return updated;
}

export function exportSessionAsJson(session: SavedSession): void {
  const blob = new Blob([JSON.stringify(session.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-set.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSessionAsMarkdown(session: SavedSession): void {
  const { data } = session;
  let md = `# ${data.title}\n\n`;
  md += `*Category: ${data.subjectCategory} | Estimated Study Time: ${data.estimatedStudyTimeMinutes} minutes*\n\n`;
  md += `${data.description}\n\n`;

  md += `## 🎴 Flashcards (${data.flashcards.length})\n\n`;
  data.flashcards.forEach((card, idx) => {
    md += `### ${idx + 1}. ${card.question}\n`;
    md += `**Answer:** ${card.answer}\n`;
    if (card.hint) md += `*Hint: ${card.hint}*\n`;
    md += `*Difficulty: ${card.difficulty.toUpperCase()} | Tag: ${card.topicTag}*\n\n`;
  });

  md += `## ❓ Quiz Questions (${data.quiz.length})\n\n`;
  data.quiz.forEach((q, idx) => {
    md += `### Q${idx + 1}. ${q.question}\n`;
    q.options.forEach((opt, oIdx) => {
      const isCorrect = oIdx === q.correctIndex ? ' ✅ (Correct)' : '';
      md += `- ${String.fromCharCode(65 + oIdx)}. ${opt}${isCorrect}\n`;
    });
    md += `\n**Explanation:** ${q.explanation}\n\n`;
  });

  md += `## 📌 Key Concepts Summary\n\n`;
  data.summary.forEach((sum) => {
    md += `### ${sum.topic}\n`;
    sum.points.forEach((pt) => {
      md += `- ${pt}\n`;
    });
    md += `\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-notes.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
