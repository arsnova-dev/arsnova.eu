import { randomInt } from 'crypto';

/** questionId → Reihenfolge der AnswerOption-IDs (Anzeige pro Session, einmal beim Quiz-Start). */
export type AnswerDisplayOrderMap = Record<string, string[]>;

const SHUFFLE_TYPES = new Set(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SURVEY']);

export function buildAnswerDisplayOrderForQuiz(
  questions: Array<{ id: string; type: string; answers?: { id: string }[] }>,
): AnswerDisplayOrderMap {
  const out: AnswerDisplayOrderMap = {};
  for (const q of questions) {
    const opts = q.answers ?? [];
    if (!SHUFFLE_TYPES.has(q.type) || opts.length <= 1) continue;
    const ids = opts.map((a) => a.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    }
    out[q.id] = ids;
  }
  return out;
}

export function orderAnswersByDisplayMap<T extends { id: string }>(
  answers: T[],
  questionId: string,
  displayOrder: unknown,
): T[] {
  if (!displayOrder || typeof displayOrder !== 'object' || Array.isArray(displayOrder)) {
    return answers;
  }
  const raw = (displayOrder as Record<string, unknown>)[questionId];
  if (!Array.isArray(raw)) return answers;
  const order = raw.filter((x): x is string => typeof x === 'string');
  const answerIds = new Set(answers.map((a) => a.id));
  if (order.length !== answers.length) return answers;
  for (const id of order) {
    if (!answerIds.has(id)) return answers;
  }
  const byId = new Map(answers.map((a) => [a.id, a]));
  return order.map((id) => byId.get(id)!);
}
