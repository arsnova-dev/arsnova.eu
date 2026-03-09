import { describe, expect, it } from 'vitest';
import { aggregateWords } from './word-cloud.util';

describe('aggregateWords', () => {
  it('aggregiert Freitext-Antworten und filtert Stopwords', () => {
    const result = aggregateWords([
      'Teamarbeit und Motivation',
      'Motivation durch Teamarbeit',
      'Klare Struktur und Motivation',
    ]);

    expect(result[0]).toEqual({ word: 'motivation', count: 3 });
    expect(result.some((entry) => entry.word === 'und')).toBe(false);
    expect(result.some((entry) => entry.word === 'teamarbeit')).toBe(true);
  });
});
