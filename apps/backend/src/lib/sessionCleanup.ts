/**
 * Automatisches Cleanup für verwaiste Sessions (Story 4.2)
 * und abgelaufene Bonus-Tokens (Story 4.6).
 */
import { prisma } from '../db';
import { logger } from './logger';

const STALE_SESSION_HOURS = 24;
const BONUS_TOKEN_RETENTION_DAYS = 90;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1h

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export async function cleanupStaleSessions(): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_SESSION_HOURS * 60 * 60 * 1000);
  const now = new Date();

  const result = await prisma.session.updateMany({
    where: {
      status: { not: 'FINISHED' },
      startedAt: { lt: cutoff },
    },
    data: {
      status: 'FINISHED',
      endedAt: now,
      statusChangedAt: now,
      currentQuestion: null,
      currentRound: 1,
    },
  });

  if (result.count > 0) {
    logger.info(`Session-Cleanup: ${result.count} verwaiste Session(s) nach ${STALE_SESSION_HOURS}h beendet.`);
  }

  return result.count;
}

export async function cleanupExpiredBonusTokens(): Promise<number> {
  const cutoff = new Date(Date.now() - BONUS_TOKEN_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.bonusToken.deleteMany({
    where: { generatedAt: { lt: cutoff } },
  });

  if (result.count > 0) {
    logger.info(`BonusToken-Cleanup: ${result.count} Token(s) älter als ${BONUS_TOKEN_RETENTION_DAYS} Tage gelöscht.`);
  }

  return result.count;
}

async function runAllCleanups(): Promise<void> {
  await cleanupStaleSessions().catch((err) => {
    logger.warn('Session-Cleanup fehlgeschlagen:', (err as Error).message);
  });
  await cleanupExpiredBonusTokens().catch((err) => {
    logger.warn('BonusToken-Cleanup fehlgeschlagen:', (err as Error).message);
  });
}

export function startSessionCleanupScheduler(): void {
  if (cleanupTimer) return;
  runAllCleanups();
  cleanupTimer = setInterval(runAllCleanups, CLEANUP_INTERVAL_MS);
  logger.info(`Cleanup-Scheduler gestartet (alle ${CLEANUP_INTERVAL_MS / 60000} Min).`);
}

export function stopSessionCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
