import { describe, expect, it } from 'vitest';
import { buildAnswerDisplayOrderForQuiz, orderAnswersByDisplayMap } from './answerDisplayOrder';

describe('orderAnswersByDisplayMap', () => {
  const answers = [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
  ];

  it('sortiert nach gespeicherter Reihenfolge', () => {
    const map = { q1: ['c', 'a', 'b'] };
    expect(orderAnswersByDisplayMap(answers, 'q1', map)).toEqual([
      { id: 'c', text: 'C' },
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ]);
  });

  it('fällt bei Längen-Mismatch auf DB-Reihenfolge zurück', () => {
    const map = { q1: ['a', 'b'] };
    expect(orderAnswersByDisplayMap(answers, 'q1', map)).toEqual(answers);
  });

  it('fällt bei unbekannter Frage auf DB-Reihenfolge zurück', () => {
    expect(orderAnswersByDisplayMap(answers, 'qx', { q1: ['a', 'b', 'c'] })).toEqual(answers);
  });
});

describe('buildAnswerDisplayOrderForQuiz', () => {
  it('liefert Permutationen nur für SC/MC/SURVEY mit >1 Option', () => {
    const qs = [
      {
        id: 'q1',
        type: 'SINGLE_CHOICE',
        answers: [{ id: 'x' }, { id: 'y' }],
      },
      {
        id: 'q2',
        type: 'FREETEXT',
        answers: [{ id: 'only' }],
      },
      {
        id: 'q3',
        type: 'SURVEY',
        answers: [{ id: 'a' }],
      },
    ];
    const out = buildAnswerDisplayOrderForQuiz(qs);
    expect(Object.keys(out).sort()).toEqual(['q1']);
    expect(new Set(out.q1)).toEqual(new Set(['x', 'y']));
    expect(out.q1).toHaveLength(2);
  });
});
