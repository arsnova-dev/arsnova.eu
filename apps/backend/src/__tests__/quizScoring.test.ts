import { describe, expect, it } from 'vitest';
import {
  calculateVoteScore,
  questionCountsTowardsTotalQuestions,
} from '../lib/quizScoring';

describe('quizScoring', () => {
  it('zählt nur MC/SC zu totalQuestions', () => {
    expect(questionCountsTowardsTotalQuestions('MULTIPLE_CHOICE')).toBe(true);
    expect(questionCountsTowardsTotalQuestions('SINGLE_CHOICE')).toBe(true);
    expect(questionCountsTowardsTotalQuestions('FREETEXT')).toBe(false);
    expect(questionCountsTowardsTotalQuestions('SURVEY')).toBe(false);
    expect(questionCountsTowardsTotalQuestions('RATING')).toBe(false);
  });

  it('gibt bei nicht-wertbaren Fragetypen immer 0 Punkte zurück', () => {
    expect(
      calculateVoteScore({
        type: 'FREETEXT',
        difficulty: 'MEDIUM',
        selectedAnswerIds: [],
        correctAnswerIds: [],
      }),
    ).toBe(0);
    expect(
      calculateVoteScore({
        type: 'SURVEY',
        difficulty: 'MEDIUM',
        selectedAnswerIds: ['a'],
        correctAnswerIds: [],
      }),
    ).toBe(0);
    expect(
      calculateVoteScore({
        type: 'RATING',
        difficulty: 'MEDIUM',
        selectedAnswerIds: [],
        correctAnswerIds: [],
      }),
    ).toBe(0);
  });

  it('gibt Punkte nur bei exakt korrekter Auswahl', () => {
    expect(
      calculateVoteScore({
        type: 'SINGLE_CHOICE',
        difficulty: 'MEDIUM',
        selectedAnswerIds: ['a1'],
        correctAnswerIds: ['a1'],
      }),
    ).toBe(2000);

    expect(
      calculateVoteScore({
        type: 'MULTIPLE_CHOICE',
        difficulty: 'HARD',
        selectedAnswerIds: ['a1', 'a2'],
        correctAnswerIds: ['a1', 'a2'],
      }),
    ).toBe(3000);

    expect(
      calculateVoteScore({
        type: 'MULTIPLE_CHOICE',
        difficulty: 'HARD',
        selectedAnswerIds: ['a1'],
        correctAnswerIds: ['a1', 'a2'],
      }),
    ).toBe(0);
  });
});

