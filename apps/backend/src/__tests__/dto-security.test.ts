import { describe, expect, it } from 'vitest';
import { AnswerOptionRevealedDTOSchema, QuestionStudentDTOSchema } from '@arsnova/shared-types';

describe('DTO security (Story 2.4)', () => {
  it('strips isCorrect from ACTIVE payloads (QuestionStudentDTO)', () => {
    const parsed = QuestionStudentDTOSchema.parse({
      id: '11111111-1111-4111-8111-111111111111',
      text: 'Welche Antwort ist korrekt?',
      type: 'SINGLE_CHOICE',
      timer: 30,
      difficulty: 'MEDIUM',
      order: 1,
      answers: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          text: 'Antwort A',
          isCorrect: true,
        },
      ],
    });

    expect(Object.prototype.hasOwnProperty.call(parsed.answers[0] ?? {}, 'isCorrect')).toBe(false);
  });

  it('requires isCorrect in RESULTS payloads (AnswerOptionRevealedDTO)', () => {
    const missingIsCorrect = AnswerOptionRevealedDTOSchema.safeParse({
      id: '33333333-3333-4333-8333-333333333333',
      text: 'Antwort B',
      voteCount: 4,
      votePercentage: 40,
    });
    expect(missingIsCorrect.success).toBe(false);

    const withIsCorrect = AnswerOptionRevealedDTOSchema.safeParse({
      id: '33333333-3333-4333-8333-333333333333',
      text: 'Antwort B',
      isCorrect: false,
      voteCount: 4,
      votePercentage: 40,
    });
    expect(withIsCorrect.success).toBe(true);
    if (withIsCorrect.success) {
      expect(withIsCorrect.data.isCorrect).toBe(false);
    }
  });
});
