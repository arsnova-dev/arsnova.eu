import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { IncomingMessage } from 'http';
import { TRPCError } from '@trpc/server';
import { getRedis } from '../redis';

const HOST_SESSION_PREFIX = 'host:session:';
const DEFAULT_HOST_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h

function normalizeSessionCode(sessionCode: string): string {
  return sessionCode.trim().toUpperCase();
}

function parseTtlSeconds(): number {
  const raw = process.env['HOST_SESSION_TTL_SECONDS'];
  if (!raw) return DEFAULT_HOST_SESSION_TTL_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 60) {
    return DEFAULT_HOST_SESSION_TTL_SECONDS;
  }
  return parsed;
}

function buildHostSessionKey(sessionCode: string): string {
  return `${HOST_SESSION_PREFIX}${normalizeSessionCode(sessionCode)}`;
}

function hashHostSessionToken(token: string): string {
  return createHash('sha256').update(token.trim(), 'utf8').digest('hex');
}

export function extractHostToken(req?: IncomingMessage): string | null {
  if (!req) return null;

  const direct = req.headers['x-host-token'];
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }

  const authHeader = req.headers['authorization'];
  if (typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return null;
  return match[1].trim();
}

export async function createHostSessionToken(sessionCode: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const ttlSeconds = parseTtlSeconds();
  const redis = getRedis();
  await redis.set(buildHostSessionKey(sessionCode), hashHostSessionToken(token), 'EX', ttlSeconds);
  return token;
}

export async function isHostSessionTokenValid(
  sessionCode: string,
  token: string,
): Promise<boolean> {
  if (!token) return false;

  const redis = getRedis();
  const storedHash = await redis.get(buildHostSessionKey(sessionCode));
  if (!storedHash) return false;

  const configured = Buffer.from(storedHash, 'utf8');
  const candidate = Buffer.from(hashHostSessionToken(token), 'utf8');
  if (configured.length !== candidate.length) {
    return false;
  }
  return timingSafeEqual(configured, candidate);
}

export async function invalidateHostSessionToken(sessionCode: string): Promise<void> {
  const redis = getRedis();
  await redis.del(buildHostSessionKey(sessionCode));
}

export async function assertHostSessionAccess(
  req: IncomingMessage | undefined,
  sessionCode: string,
): Promise<string> {
  const token = extractHostToken(req);
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Host-Authentifizierung erforderlich.' });
  }

  const valid = await isHostSessionTokenValid(sessionCode, token);
  if (!valid) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Host-Session ungültig oder abgelaufen.',
    });
  }

  return token;
}
