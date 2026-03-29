import { beforeEach, describe, expect, it, vi } from 'vitest';

const { redisMock, prismaMock } = vi.hoisted(() => ({
  redisMock: { get: vi.fn() },
  prismaMock: {
    session: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../redis', () => ({
  getRedis: () => redisMock,
}));

vi.mock('../db', () => ({
  prisma: prismaMock,
}));

import { quickFeedbackRouter } from '../routers/quickFeedback';

const caller = quickFeedbackRouter.createCaller({ req: undefined });
const VOTER_ID = '33333333-3333-4333-8333-333333333333';

describe('quickFeedback.vote und Session-Status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lehnt ab, wenn die Live-Session beendet ist', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
      quickFeedbackEnabled: true,
      status: 'FINISHED',
    });

    await expect(
      caller.vote({
        sessionCode: 'ABCDEF',
        voterId: VOTER_ID,
        value: 'POSITIVE',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(redisMock.get).not.toHaveBeenCalled();
  });
});
