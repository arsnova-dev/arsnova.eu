import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, extractHostTokenMock, isHostSessionTokenValidMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findUnique: vi.fn(),
    },
  },
  extractHostTokenMock: vi.fn(),
  isHostSessionTokenValidMock: vi.fn(),
}));

vi.mock('../db', () => ({
  prisma: prismaMock,
}));

vi.mock('../lib/hostAuth', () => ({
  extractHostToken: extractHostTokenMock,
  isHostSessionTokenValid: isHostSessionTokenValidMock,
}));

import { sessionRouter } from '../routers/session';

const caller = sessionRouter.createCaller({ req: {} as never });
const CODE = 'ABC123';

describe('session.getCurrentQuestionForHost (Story 2.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    extractHostTokenMock.mockReturnValue('host-token-123');
    isHostSessionTokenValidMock.mockResolvedValue(true);
  });

  it('liefert aktuelle Frage mit Antwortoptionen und isCorrect', async () => {
    const a1Id = 'aaaaaaaa-1111-4111-8111-111111111111';
    const a2Id = 'bbbbbbbb-2222-4222-8222-222222222222';
    prismaMock.session.findUnique.mockResolvedValue({
      id: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
      quiz: {
        questions: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            order: 0,
            text: 'Was ist 2+2?',
            type: 'SINGLE_CHOICE',
            answers: [
              { id: a1Id, text: '3', isCorrect: false },
              { id: a2Id, text: '4', isCorrect: true },
            ],
          },
        ],
      },
      currentQuestion: 0,
    });

    const result = await caller.getCurrentQuestionForHost({ code: CODE });

    expect(result).not.toBeNull();
    expect(result!.order).toBe(0);
    expect(result!.text).toBe('Was ist 2+2?');
    expect(result!.type).toBe('SINGLE_CHOICE');
    expect(result!.answers).toHaveLength(2);
    expect(result!.answers[0]).toEqual({ id: a1Id, text: '3', isCorrect: false });
    expect(result!.answers[1]).toEqual({ id: a2Id, text: '4', isCorrect: true });
  });

  it('liefert null wenn keine Session', async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const result = await caller.getCurrentQuestionForHost({ code: 'NONEXI' });

    expect(result).toBeNull();
  });

  it('liefert null wenn currentQuestion null (noch in Lobby)', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
      currentQuestion: null,
      quiz: {
        questions: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            order: 0,
            text: 'Frage',
            type: 'SINGLE_CHOICE',
            answers: [],
          },
        ],
      },
    });

    const result = await caller.getCurrentQuestionForHost({ code: CODE });

    expect(result).toBeNull();
  });

  it('liefert null wenn kein Quiz (Q&A-Session)', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      currentQuestion: 0,
      quiz: null,
    });

    const result = await caller.getCurrentQuestionForHost({ code: CODE });

    expect(result).toBeNull();
  });

  it('lehnt die Host-Abfrage ohne gültigen Token ab', async () => {
    isHostSessionTokenValidMock.mockResolvedValue(false);

    await expect(caller.getCurrentQuestionForHost({ code: CODE })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Host-Session ungültig oder abgelaufen.',
    });
  });
});
