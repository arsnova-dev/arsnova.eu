/**
 * Health & Server-Status (Story 0.1, 0.2, 0.4).
 * check | stats | footerBundle (Check+Stats parallel, ein Client-Request) | ping: Subscription Heartbeat
 */
import { publicProcedure, router } from '../trpc';
import {
  HealthCheckResponseSchema,
  HealthFooterBundleSchema,
  HealthPingEventSchema,
  ServerStatsDTOSchema,
} from '@arsnova/shared-types';
import { pingRedis, getRedis } from '../redis';
import { prisma } from '../db';
import { logger } from '../lib/logger';
import { updateCompletedSessionsTotal } from '../lib/platformStatistic';

const SERVER_STATUS_THRESHOLDS = {
  healthy: 50,
  busy: 200,
} as const;

const ACTIVE_SESSION_STATUSES = [
  'LOBBY',
  'QUESTION_OPEN',
  'ACTIVE',
  'PAUSED',
  'RESULTS',
  'DISCUSSION',
] as const;
/**
 * "Live" im Footer bedeutet: Session ist in aktivem Status und wurde in den letzten 24h
 * aktualisiert. Das entkoppelt die Anzeige von Cleanup-Ausfällen und verhindert "hängende"
 * Kennzahlen durch verwaiste Alt-Sessions.
 */
const ACTIVE_SESSION_FRESH_HOURS = 24;

function getServerStatus(activeSessions: number): 'healthy' | 'busy' | 'overloaded' {
  if (activeSessions < SERVER_STATUS_THRESHOLDS.healthy) return 'healthy';
  if (activeSessions < SERVER_STATUS_THRESHOLDS.busy) return 'busy';
  return 'overloaded';
}

/**
 * Zählt aktive Quick-Feedback-Runden ohne blockierendes Redis KEYS.
 * Nutzt cursor-basiertes SCAN. Nur Primär-Payload-Keys `qf:<code>` zählen — nicht
 * `qf:voters:…`, `qf:choices:…`, `qf:choices:r1:…` oder `qf:host:…` (sonst mehrfache Zählung pro Runde).
 */
async function countActiveBlitzRounds(): Promise<number> {
  const redis = getRedis();
  let cursor = '0';
  const primaryCodes = new Set<string>();

  do {
    const result = await redis.scan(cursor, 'MATCH', 'qf:*', 'COUNT', 200);
    cursor = result[0];
    const keys = result[1];
    for (const key of keys) {
      const segments = key.split(':');
      if (segments.length === 2 && segments[0] === 'qf' && segments[1].length > 0) {
        primaryCodes.add(key);
      }
    }
  } while (cursor !== '0');

  return primaryCodes.size;
}

/** Async-Generator für Heartbeat-Subscription (exportiert für Unit-Tests). */
export async function* heartbeatGenerator(
  intervalMs: number = 5000,
): AsyncGenerator<{ heartbeat: string }> {
  while (true) {
    yield HealthPingEventSchema.parse({ heartbeat: new Date().toISOString() });
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

async function fetchHealthCheck() {
  const redisOk = await pingRedis();
  return {
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    redis: redisOk ? ('ok' as const) : ('unavailable' as const),
  };
}

/** Server-Statistik für Startseite (Story 0.4). Bei nicht erreichbarer DB: Fallback (0 Werte), keine Prisma-Fehler. */
async function fetchServerStats() {
  const activeCutoff = new Date(Date.now() - ACTIVE_SESSION_FRESH_HOURS * 60 * 60 * 1000);
  const activeStatuses = [...ACTIVE_SESSION_STATUSES];
  const activeSessionWhere = {
    status: { in: activeStatuses },
    statusChangedAt: { gte: activeCutoff },
  };

  let activeBlitzRounds = 0;
  try {
    activeBlitzRounds = await countActiveBlitzRounds();
  } catch (err) {
    logger.warn(
      'health.stats: activeBlitzRounds konnte nicht aus Redis gelesen werden, setze 0.',
      err,
    );
  }

  try {
    const [activeSessions, completedSessionsNow, totalParticipants, platformRow] =
      await Promise.all([
        prisma.session.count({ where: activeSessionWhere }),
        // Momentan in DB vorhandene FINISHED-Sessions (kann durch Purge sinken).
        prisma.session.count({ where: { status: 'FINISHED' } }),
        // Alle Teilnehmer-Einträge zu Sessions mit aktivem Status und frischer Aktivität.
        prisma.participant.count({
          where: { session: activeSessionWhere },
        }),
        prisma.platformStatistic.findUnique({
          where: { id: 'default' },
          select: {
            maxParticipantsSingleSession: true,
            completedSessionsTotal: true,
            updatedAt: true,
          },
        }),
      ]);
    const completedSessionsTotal = Math.max(
      completedSessionsNow,
      platformRow?.completedSessionsTotal ?? 0,
    );
    if (completedSessionsNow > (platformRow?.completedSessionsTotal ?? 0)) {
      void updateCompletedSessionsTotal(completedSessionsNow);
    }
    return {
      activeSessions,
      totalParticipants,
      completedSessions: completedSessionsTotal,
      activeBlitzRounds,
      maxParticipantsSingleSession: platformRow?.maxParticipantsSingleSession ?? 0,
      maxParticipantsStatisticUpdatedAt: platformRow?.updatedAt?.toISOString() ?? null,
      serverStatus: getServerStatus(activeSessions),
    };
  } catch {
    return {
      activeSessions: 0,
      totalParticipants: 0,
      completedSessions: 0,
      activeBlitzRounds: 0,
      maxParticipantsSingleSession: 0,
      maxParticipantsStatisticUpdatedAt: null,
      serverStatus: 'healthy' as const,
    };
  }
}

export const healthRouter = router({
  check: publicProcedure.output(HealthCheckResponseSchema).query(() => fetchHealthCheck()),

  stats: publicProcedure.output(ServerStatsDTOSchema).query(() => fetchServerStats()),

  /**
   * App-Footer: ein Client-Request statt check→stats nacheinander (kürzere kritische Netzwerk-Kette / LCP).
   * Server führt Check und Stats parallel aus.
   */
  footerBundle: publicProcedure.output(HealthFooterBundleSchema).query(async () => {
    const [check, stats] = await Promise.all([fetchHealthCheck(), fetchServerStats()]);
    return { check, stats };
  }),

  /** Subscription: Heartbeat alle 5s (Story 0.2 – Test für WebSocket). */
  ping: publicProcedure.subscription(() => heartbeatGenerator(5000)),
});
