import {
  DIFFICULTY_MULTIPLIER,
  MAX_BASE_POINTS,
  type Difficulty,
  type QuestionType,
} from '@arsnova/shared-types';

const SCORED_QUESTION_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'];

/**
 * Nur MC/SC zählen in Leaderboard-Metriken wie totalQuestions (Story 1.2b / 4.1).
 */
export function questionCountsTowardsTotalQuestions(type: QuestionType): boolean {
  return SCORED_QUESTION_TYPES.includes(type);
}

interface CalculateVoteScoreInput {
  type: QuestionType;
  difficulty: Difficulty;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
}

/**
 * Punkte für eine abgegebene Antwort.
 * Nicht-wertbare Typen (SURVEY, FREETEXT, RATING) geben immer 0 Punkte zurück.
 */
export function calculateVoteScore(input: CalculateVoteScoreInput): number {
  if (!questionCountsTowardsTotalQuestions(input.type)) {
    return 0;
  }

  const selected = new Set(input.selectedAnswerIds);
  const correct = new Set(input.correctAnswerIds);
  const isCorrect =
    selected.size === correct.size && [...selected].every((id) => correct.has(id));

  if (!isCorrect) {
    return 0;
  }

  return MAX_BASE_POINTS * DIFFICULTY_MULTIPLIER[input.difficulty];
}

