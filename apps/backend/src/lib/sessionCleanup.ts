/**
 * Automatisches Cleanup für verwaiste Sessions (Story 4.2).
 * Sessions, die länger als 24h nicht beendet wurden, werden auf FINISHED gesetzt.
 */
import { prisma } from '../db';
import { logger } from './logger';

const STALE_SESSION_HOURS = 24;
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

export function startSessionCleanupScheduler(): void {
  if (cleanupTimer) return;
  cleanupStaleSessions().catch((err) => {
    logger.warn('Session-Cleanup beim Start fehlgeschlagen:', (err as Error).message);
  });
  cleanupTimer = setInterval(() => {
    cleanupStaleSessions().catch((err) => {
      logger.warn('Session-Cleanup fehlgeschlagen:', (err as Error).message);
    });
  }, CLEANUP_INTERVAL_MS);
  logger.info(`Session-Cleanup-Scheduler gestartet (alle ${CLEANUP_INTERVAL_MS / 60000} Min, Schwelle: ${STALE_SESSION_HOURS}h).`);
}

export function stopSessionCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
