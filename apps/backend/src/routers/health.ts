/**
 * Health & Server-Status (Story 0.1, 0.2, 0.4).
 * check: API + optional Redis | stats: aggregierte Kennzahlen | ping: Subscription Heartbeat
 */
import { publicProcedure, router } from '../trpc';
import {
  HealthCheckResponseSchema,
  HealthPingEventSchema,
  ServerStatsDTOSchema,
} from '@arsnova/shared-types';
import { pingRedis, getRedis } from '../redis';
import { prisma } from '../db';

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

function getServerStatus(activeSessions: number): 'healthy' | 'busy' | 'overloaded' {
  if (activeSessions < SERVER_STATUS_THRESHOLDS.healthy) return 'healthy';
  if (activeSessions < SERVER_STATUS_THRESHOLDS.busy) return 'busy';
  return 'overloaded';
}

/**
 * Zählt aktive Quick-Feedback-Runden ohne blockierendes Redis KEYS.
 * Nutzt cursor-basiertes SCAN und ignoriert interne voter-Sets.
 */
async function countActiveBlitzRounds(): Promise<number> {
  const redis = getRedis();
  let cursor = '0';
  const rounds = new Set<string>();

  do {
    const result = await redis.scan(cursor, 'MATCH', 'qf:*', 'COUNT', 200);
    cursor = result[0];
    const keys = result[1];
    for (const key of keys) {
      if (!key.includes(':voters:')) {
        rounds.add(key);
      }
    }
  } while (cursor !== '0');

  return rounds.size;
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

export const healthRouter = router({
  check: publicProcedure.output(HealthCheckResponseSchema).query(async () => {
    const redisOk = await pingRedis();
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      redis: redisOk ? 'ok' : 'unavailable',
    };
  }),

  /** Server-Statistik für Startseite (Story 0.4). Bei nicht erreichbarer DB: Fallback (0 Werte), keine Prisma-Fehler. */
  stats: publicProcedure.output(ServerStatsDTOSchema).query(async () => {
    try {
      const [activeSessions, completedSessions, totalParticipants, blitzKeys] = await Promise.all([
        prisma.session.count({ where: { status: { in: [...ACTIVE_SESSION_STATUSES] } } }),
        prisma.session.count({ where: { status: 'FINISHED' } }),
        prisma.participant.count({
          where: { session: { status: { in: [...ACTIVE_SESSION_STATUSES] } } },
        }),
        countActiveBlitzRounds(),
      ]);
      return {
        activeSessions,
        totalParticipants,
        completedSessions,
        activeBlitzRounds: blitzKeys,
        serverStatus: getServerStatus(activeSessions),
      };
    } catch {
      return {
        activeSessions: 0,
        totalParticipants: 0,
        completedSessions: 0,
        activeBlitzRounds: 0,
        serverStatus: 'healthy' as const,
      };
    }
  }),

  /** Subscription: Heartbeat alle 5s (Story 0.2 – Test für WebSocket). */
  ping: publicProcedure.subscription(() => heartbeatGenerator(5000)),
});
