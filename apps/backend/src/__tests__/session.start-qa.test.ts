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

vi.mock('../lib/rateLimit', () => ({
  checkSessionCreateRate: vi.fn(),
  isSessionCodeLockedOut: vi.fn(),
  recordFailedSessionCodeAttempt: vi.fn(),
}));

vi.mock('../lib/hostAuth', () => ({
  extractHostToken: extractHostTokenMock,
  isHostSessionTokenValid: isHostSessionTokenValidMock,
}));

import { sessionRouter } from '../routers/session';

const caller = sessionRouter.createCaller({ req: {} as never });
const SESSION_ID = '6a8edced-5f8f-4cfa-9176-454fac9570ad';

describe('session.startQa (Story 8.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    extractHostTokenMock.mockReturnValue('host-token-123');
    isHostSessionTokenValidMock.mockResolvedValue(true);
    prismaMock.session.update.mockResolvedValue({
      id: SESSION_ID,
      status: 'ACTIVE',
    });
  });

  it('startet eine Q&A-Session aus der Lobby in ACTIVE', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'Q_AND_A',
      status: 'LOBBY',
      qaEnabled: true,
    });

    const result = await caller.startQa({ code: 'abc123' });

    expect(result.status).toBe('ACTIVE');
    expect(result.currentQuestion).toBeNull();
    expect(result.currentRound).toBe(1);
    expect(result.activeAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { code: 'ABC123' },
      select: { id: true, status: true, type: true, qaEnabled: true },
    });
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: SESSION_ID },
      data: expect.objectContaining({ status: 'ACTIVE' }),
    });
  });

  it('lässt Quiz-Sessions mit Fragen-Kanal in der Lobby (Beitrittsphase fürs Quiz bleibt)', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'QUIZ',
      status: 'LOBBY',
      qaEnabled: true,
    });

    const result = await caller.startQa({ code: 'ABC123' });

    expect(result.status).toBe('LOBBY');
    expect(result.currentQuestion).toBeNull();
    expect(result.currentRound).toBe(1);
    expect(prismaMock.session.update).not.toHaveBeenCalled();
  });

  it('lehnt den Start außerhalb der Lobby ab', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: SESSION_ID,
      type: 'Q_AND_A',
      status: 'ACTIVE',
      qaEnabled: true,
    });

    await expect(caller.startQa({ code: 'ABC123' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Q&A-Session kann nur aus Status LOBBY gestartet werden. Aktuell: ACTIVE.',
    });

    expect(prismaMock.session.update).not.toHaveBeenCalled();
  });
});
