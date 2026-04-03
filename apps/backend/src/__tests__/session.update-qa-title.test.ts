import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, extractHostTokenMock, isHostSessionTokenValidMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findUnique: vi.fn(),
      update: vi.fn(),
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
const SESSION_ID = '6a8edced-5f8f-4cfa-9176-454fac9570ad';
const CODE = 'ABC123';

describe('session.updateQaTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    extractHostTokenMock.mockReturnValue('host-token-123');
    isHostSessionTokenValidMock.mockResolvedValue(true);
  });

  it('setzt qaTitle bei Quiz-Session mit Q&A-Kanal', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'QUIZ',
      qaEnabled: true,
    });
    prismaMock.session.update.mockResolvedValue({
      qaTitle: 'Diskussion',
      title: null,
    });

    const result = await caller.updateQaTitle({ code: CODE, qaTitle: 'Diskussion' });

    expect(result).toEqual({ qaTitle: 'Diskussion', title: null });
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: SESSION_ID },
      data: { qaTitle: 'Diskussion' },
      select: { qaTitle: true, title: true },
    });
  });

  it('synchronisiert title bei reiner Q_AND_A-Session', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'Q_AND_A',
      qaEnabled: false,
    });
    prismaMock.session.update.mockResolvedValue({
      qaTitle: 'Fragerunde',
      title: 'Fragerunde',
    });

    await caller.updateQaTitle({ code: CODE, qaTitle: 'Fragerunde' });

    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: SESSION_ID },
      data: { qaTitle: 'Fragerunde', title: 'Fragerunde' },
      select: { qaTitle: true, title: true },
    });
  });

  it('leert Titel wenn qaTitle leer', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'QUIZ',
      qaEnabled: true,
    });
    prismaMock.session.update.mockResolvedValue({
      qaTitle: null,
      title: null,
    });

    await caller.updateQaTitle({ code: CODE, qaTitle: '   ' });

    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: SESSION_ID },
      data: { qaTitle: null },
      select: { qaTitle: true, title: true },
    });
  });

  it('lehnt ab wenn Q&A nicht aktiv', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'QUIZ',
      qaEnabled: false,
    });

    await expect(caller.updateQaTitle({ code: CODE, qaTitle: 'X' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    expect(prismaMock.session.update).not.toHaveBeenCalled();
  });
});
