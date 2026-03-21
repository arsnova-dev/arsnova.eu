import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../db', () => ({
  prisma: prismaMock,
}));

import { sessionRouter } from '../routers/session';

const caller = sessionRouter.createCaller({ req: undefined });
const QUIZ_ID = '11111111-1111-4111-8111-111111111111';

describe('session.getBonusTokensForQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('liefert beendete Sessions mit Bonus-Tokens zur Server-Quiz-ID', async () => {
    const endedAt = new Date('2026-03-10T12:00:00.000Z');
    const generatedAt = new Date('2026-03-10T12:05:00.000Z');
    prismaMock.session.findMany.mockResolvedValue([
      {
        id: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
        code: 'ABCDEF',
        endedAt,
        startedAt: new Date('2026-03-10T11:00:00.000Z'),
        quiz: { name: 'Chemie' },
        bonusTokens: [
          {
            token: 'BNS-TEST-1234',
            nickname: 'Ada',
            quizName: 'Chemie',
            totalScore: 42,
            rank: 1,
            generatedAt,
          },
        ],
      },
    ]);

    const result = await caller.getBonusTokensForQuiz({ quizId: QUIZ_ID });

    expect(prismaMock.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          quizId: QUIZ_ID,
          status: 'FINISHED',
        }),
      }),
    );
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]?.sessionCode).toBe('ABCDEF');
    expect(result.sessions[0]?.endedAt).toBe(endedAt.toISOString());
    expect(result.sessions[0]?.tokens[0]?.token).toBe('BNS-TEST-1234');
  });
});
