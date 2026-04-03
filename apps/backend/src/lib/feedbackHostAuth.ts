import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { IncomingMessage } from 'node:http';
import { TRPCError } from '@trpc/server';
import { getRedis } from '../redis';

const FEEDBACK_HOST_PREFIX = 'qf:host:';
const FEEDBACK_HOST_TTL_SECONDS = 30 * 60;

function normalizeFeedbackCode(sessionCode: string): string {
  return sessionCode.trim().toUpperCase();
}

function buildFeedbackHostKey(sessionCode: string): string {
  return `${FEEDBACK_HOST_PREFIX}${normalizeFeedbackCode(sessionCode)}`;
}

function hashFeedbackHostToken(token: string): string {
  return createHash('sha256').update(token.trim(), 'utf8').digest('hex');
}

export function extractFeedbackHostToken(req?: IncomingMessage): string | null {
  if (!req) return null;

  const direct = req.headers['x-feedback-host-token'];
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }

  return null;
}

export async function createFeedbackHostToken(sessionCode: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const redis = getRedis();
  await redis.set(
    buildFeedbackHostKey(sessionCode),
    hashFeedbackHostToken(token),
    'EX',
    FEEDBACK_HOST_TTL_SECONDS,
  );
  return token;
}

export async function isFeedbackHostTokenValid(
  sessionCode: string,
  token: string,
): Promise<boolean> {
  if (!token) return false;

  const redis = getRedis();
  const storedHash = await redis.get(buildFeedbackHostKey(sessionCode));
  if (!storedHash) return false;

  const configured = Buffer.from(storedHash, 'utf8');
  const candidate = Buffer.from(hashFeedbackHostToken(token), 'utf8');
  if (configured.length !== candidate.length) {
    return false;
  }

  return timingSafeEqual(configured, candidate);
}

export async function assertFeedbackHostAccess(
  req: IncomingMessage | undefined,
  sessionCode: string,
): Promise<string> {
  const token = extractFeedbackHostToken(req);
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Blitzlicht-Host-Authentifizierung erforderlich.',
    });
  }

  const valid = await isFeedbackHostTokenValid(sessionCode, token);
  if (!valid) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Blitzlicht-Host-Session ungueltig oder abgelaufen.',
    });
  }

  return token;
}

export async function invalidateFeedbackHostToken(sessionCode: string): Promise<void> {
  const redis = getRedis();
  await redis.del(buildFeedbackHostKey(sessionCode));
}
