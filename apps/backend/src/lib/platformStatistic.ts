/**
 * Plattformweite Kennzahl: höchste Teilnehmerzahl in einer einzelnen Session.
 * Aktualisierung atomar per GREATEST (parallel Join-sicher).
 */
import { prisma } from '../db';
import { logger } from './logger';

export const PLATFORM_STATISTIC_ID = 'default';

/**
 * Erhöht den gespeicherten Rekord, falls `participantCount` höher ist.
 * Fehler werden geloggt und geschluckt – Aufrufer (z. B. Join) darf nicht fehlschlagen.
 */
export async function updateMaxParticipantsSingleSession(participantCount: number): Promise<void> {
  if (!Number.isFinite(participantCount) || participantCount < 1) return;
  try {
    await prisma.$executeRaw`
      INSERT INTO "PlatformStatistic" ("id", "maxParticipantsSingleSession", "completedSessionsTotal", "updatedAt")
      VALUES (${PLATFORM_STATISTIC_ID}, ${participantCount}, 0, NOW())
      ON CONFLICT ("id") DO UPDATE
      SET
        "maxParticipantsSingleSession" = GREATEST(
          "PlatformStatistic"."maxParticipantsSingleSession",
          EXCLUDED."maxParticipantsSingleSession"
        ),
        "updatedAt" = CASE
          WHEN EXCLUDED."maxParticipantsSingleSession" > "PlatformStatistic"."maxParticipantsSingleSession"
            THEN NOW()
          ELSE "PlatformStatistic"."updatedAt"
        END
    `;
  } catch (e) {
    logger.warn(
      'PlatformStatistic: maxParticipantsSingleSession konnte nicht aktualisiert werden',
      e,
    );
  }
}

/**
 * Persistiert eine monotone Gesamtzahl beendeter Sessions (FINISHED), damit die
 * Kennzahl in health.stats trotz Session-Purge nicht sinkt.
 *
 * Wichtig: `updatedAt` bleibt unverändert, da es für den Rekord-Zeitstempel
 * (`maxParticipantsStatisticUpdatedAt`) reserviert ist.
 */
export async function updateCompletedSessionsTotal(completedSessions: number): Promise<void> {
  if (!Number.isFinite(completedSessions) || completedSessions < 0) return;
  try {
    await prisma.$executeRaw`
      INSERT INTO "PlatformStatistic" ("id", "maxParticipantsSingleSession", "completedSessionsTotal", "updatedAt")
      VALUES (${PLATFORM_STATISTIC_ID}, 0, ${completedSessions}, NOW())
      ON CONFLICT ("id") DO UPDATE
      SET
        "completedSessionsTotal" = GREATEST(
          "PlatformStatistic"."completedSessionsTotal",
          EXCLUDED."completedSessionsTotal"
        ),
        "updatedAt" = "PlatformStatistic"."updatedAt"
    `;
  } catch (e) {
    logger.warn('PlatformStatistic: completedSessionsTotal konnte nicht aktualisiert werden', e);
  }
}
