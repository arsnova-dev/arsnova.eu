import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    vote: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../db', () => ({
  prisma: prismaMock,
}));

import { sessionRouter } from '../routers/session';

const caller = sessionRouter.createCaller({ req: undefined });
const SESSION_ID = '6a8edced-5f8f-4cfa-9176-454fac9570ad';
const QUESTION_ID = '7ed3cc25-3179-4a91-9dc3-acc00971fb46';

describe('session.getLiveFreetext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('liefert Freitextantworten der aktuell aktiven FREETEXT-Frage', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      currentQuestion: 1,
      quiz: {
        questions: [
          {
            id: QUESTION_ID,
            order: 1,
            type: 'FREETEXT',
            text: 'Was war heute hilfreich?',
          },
        ],
      },
    });
    prismaMock.vote.findMany.mockResolvedValue([
      { freeText: ' Klare Struktur ' },
      { freeText: 'Mehr Praxisbeispiele' },
      { freeText: '   ' },
    ]);

    const result = await caller.getLiveFreetext({ code: 'ABC123' });

    expect(result.sessionId).toBe(SESSION_ID);
    expect(result.questionId).toBe(QUESTION_ID);
    expect(result.questionType).toBe('FREETEXT');
    expect(result.responses).toEqual(['Klare Struktur', 'Mehr Praxisbeispiele']);
    expect(prismaMock.vote.findMany).toHaveBeenCalledTimes(1);
  });

  it('gibt bei nicht-FREITEXT-Fragen leere Antworten zurück', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      currentQuestion: 0,
      quiz: {
        questions: [
          {
            id: QUESTION_ID,
            order: 0,
            type: 'SINGLE_CHOICE',
            text: 'Welche Antwort stimmt?',
          },
        ],
      },
    });

    const result = await caller.getLiveFreetext({ code: 'ABC123' });

    expect(result.questionType).toBe('SINGLE_CHOICE');
    expect(result.responses).toEqual([]);
    expect(prismaMock.vote.findMany).not.toHaveBeenCalled();
  });
});

describe('session.getActiveQuizIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('liefert Quiz-IDs von laufenden Sessions', async () => {
    prismaMock.session.findMany.mockResolvedValue([
      { quizId: '11111111-1111-4111-8111-111111111111' },
      { quizId: '22222222-2222-4222-8222-222222222222' },
    ]);

    const result = await caller.getActiveQuizIds();

    expect(result).toEqual([
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ]);
  });
});

describe('session.getFreetextSessionExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregiert Freitextantworten pro Frage für Session-Export', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      code: 'ABC123',
      quiz: {
        questions: [
          { id: QUESTION_ID, order: 0, text: 'Feedback?' },
          { id: '7b90667d-d4ef-4dce-bf09-76eeb91a5efd', order: 1, text: 'Was verbessern?' },
        ],
      },
    });
    prismaMock.vote.findMany.mockResolvedValue([
      { questionId: QUESTION_ID, freeText: ' Klar ' },
      { questionId: QUESTION_ID, freeText: 'Klar' },
      { questionId: '7b90667d-d4ef-4dce-bf09-76eeb91a5efd', freeText: 'Mehr Beispiele' },
    ]);

    const result = await caller.getFreetextSessionExport({ code: 'ABC123' });

    expect(result.sessionId).toBe(SESSION_ID);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]?.aggregates[0]).toEqual({ text: 'Klar', count: 2 });
    expect(result.entries[1]?.aggregates[0]).toEqual({ text: 'Mehr Beispiele', count: 1 });
  });
});
