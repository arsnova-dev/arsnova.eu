import { TRPCError } from '@trpc/server';
import { vi, type Mock } from 'vitest';

/**
 * Vitest-Mock für `../lib/hostAuth`: überschreibt nur Token-Reads/Validierung,
 * damit `extractHostTokenFromContext` / `assertHostSessionAccessFromContext` konsistent bleiben
 * (reine `importOriginal`-Spies funktionieren nicht für interne Modulaufrufe).
 */
export function buildHostAuthTestMock(mocks: {
  extractHostToken: Mock;
  extractHostTokenFromConnectionParams: Mock;
  isHostSessionTokenValid: Mock;
}) {
  const extractHostTokenFromContext = (ctx: {
    req?: unknown;
    connectionParams?: unknown;
  }): string | null =>
    mocks.extractHostToken(ctx.req) ??
    mocks.extractHostTokenFromConnectionParams(ctx.connectionParams);

  const assertHostSessionAccessFromContext = async (
    ctx: { req?: unknown; connectionParams?: unknown },
    sessionCode: string,
  ): Promise<string> => {
    const token = extractHostTokenFromContext(ctx);
    if (!token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Host-Authentifizierung erforderlich.',
      });
    }
    const valid = await mocks.isHostSessionTokenValid(sessionCode, token);
    if (!valid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Host-Session ungültig oder abgelaufen.',
      });
    }
    return token;
  };

  const assertHostSessionAccess = async (
    req: unknown,
    sessionCode: string,
    connectionParams?: unknown,
  ): Promise<string> => assertHostSessionAccessFromContext({ req, connectionParams }, sessionCode);

  return {
    extractHostToken: mocks.extractHostToken,
    extractHostTokenFromConnectionParams: mocks.extractHostTokenFromConnectionParams,
    extractHostTokenFromContext,
    isHostSessionTokenValid: mocks.isHostSessionTokenValid,
    assertHostSessionAccessFromContext,
    assertHostSessionAccess,
    createHostSessionToken: vi.fn(),
    invalidateHostSessionToken: vi.fn(),
  };
}
