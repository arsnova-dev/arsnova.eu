import { describe, expect, it } from 'vitest';
import { buildKiQuizSystemPrompt } from './ki-quiz-prompt';

describe('buildKiQuizSystemPrompt', () => {
  it('enthält den UI-Kontext und Schema-Hinweise', () => {
    const prompt = buildKiQuizSystemPrompt({
      presetLabel: 'Seriös',
      nicknameTheme: 'HIGH_SCHOOL',
      readingPhaseEnabled: true,
      defaultDifficulty: 'MEDIUM',
    });

    expect(prompt).toContain('Preset: Seriös');
    expect(prompt).toContain('nicknameTheme');
    expect(prompt).toContain('Return ONLY valid JSON.');
    expect(prompt).toContain('"type": "SINGLE_CHOICE"|"MULTIPLE_CHOICE"|"FREETEXT"|"SURVEY"|"RATING"');
  });
});
