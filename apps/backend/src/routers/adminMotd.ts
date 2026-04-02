/**
 * Admin — MOTD & Vorlagen (Epic 10).
 */
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { MotdLocaleBodies } from '@arsnova/shared-types';
import {
  AdminMotdCreateInputSchema,
  AdminMotdDetailDTOSchema,
  AdminMotdIdInputSchema,
  AdminMotdListOutputSchema,
  AdminMotdListItemDTOSchema,
  AdminMotdTemplateCreateInputSchema,
  AdminMotdTemplateDTOSchema,
  AdminMotdTemplateListOutputSchema,
  AdminMotdTemplateUpdateInputSchema,
  AdminMotdUpdateInputSchema,
  MotdLocaleBodiesSchema,
} from '@arsnova/shared-types';
import { createHash } from 'node:crypto';
import type { MotdAuditAction } from '@prisma/client';
import { prisma } from '../db';
import { adminProcedure, router } from '../trpc';

const APP_LOCALES = ['de', 'en', 'fr', 'es', 'it'] as const;

function shortAdminId(token: string | undefined): string | null {
  if (!token) return null;
  return createHash('sha256').update(token, 'utf8').digest('hex').slice(0, 24);
}

async function logMotdAudit(
  action: MotdAuditAction,
  motdId: string,
  adminToken: string | undefined,
  metadata?: Record<string, unknown>,
) {
  await prisma.motdAuditLog.create({
    data: {
      action,
      motdId,
      adminIdentifier: shortAdminId(adminToken),
      metadataJson: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

function rowsToBodies(rows: Array<{ locale: string; markdown: string }>): MotdLocaleBodies {
  const raw: Record<string, string> = { de: '', en: '', fr: '', es: '', it: '' };
  for (const r of rows) {
    if (r.locale in raw) raw[r.locale] = r.markdown;
  }
  return MotdLocaleBodiesSchema.parse(raw);
}

function withDefinedProp<K extends string, V>(key: K, value: V | undefined): Partial<Record<K, V>> {
  if (value === undefined) return {};
  return { [key]: value } as Partial<Record<K, V>>;
}

function resolveMotdTimeRange(
  currentStartsAt: Date,
  currentEndsAt: Date,
  inputStartsAt: string | undefined,
  inputEndsAt: string | undefined,
) {
  const startsAt = inputStartsAt === undefined ? currentStartsAt : new Date(inputStartsAt);
  const endsAt = inputEndsAt === undefined ? currentEndsAt : new Date(inputEndsAt);
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'endsAt muss nach startsAt liegen.' });
  }
  return { startsAt, endsAt };
}

function shouldIncrementMotdContentVersion(
  existing: {
    contentVersion: number;
    startsAt: Date;
    endsAt: Date;
    priority: number;
    locales: MotdLocaleBodies;
  },
  next: {
    startsAt: Date;
    endsAt: Date;
    priority: number | undefined;
    locales: MotdLocaleBodies | undefined;
  },
): boolean {
  const nextLocales = next.locales;
  const localeChanged =
    nextLocales === undefined
      ? false
      : APP_LOCALES.some((loc) => existing.locales[loc] !== nextLocales[loc]);
  const scheduleChanged =
    next.startsAt.getTime() !== existing.startsAt.getTime() ||
    next.endsAt.getTime() !== existing.endsAt.getTime();
  const priorityChanged = next.priority !== undefined && next.priority !== existing.priority;
  return localeChanged || scheduleChanged || priorityChanged;
}

function buildTemplateUpdateData(input: {
  name?: string;
  description?: string | null;
  markdownDe?: string;
  markdownEn?: string;
  markdownFr?: string;
  markdownEs?: string;
  markdownIt?: string;
}) {
  return {
    ...withDefinedProp('name', input.name),
    ...withDefinedProp('description', input.description),
    ...withDefinedProp('markdownDe', input.markdownDe),
    ...withDefinedProp('markdownEn', input.markdownEn),
    ...withDefinedProp('markdownFr', input.markdownFr),
    ...withDefinedProp('markdownEs', input.markdownEs),
    ...withDefinedProp('markdownIt', input.markdownIt),
  };
}

function buildMotdUpdateData(input: {
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  priority?: number;
  visibleInArchive?: boolean;
  templateId?: string | null;
}) {
  return {
    ...withDefinedProp('status', input.status),
    ...withDefinedProp('priority', input.priority),
    ...withDefinedProp('visibleInArchive', input.visibleInArchive),
    ...withDefinedProp('templateId', input.templateId),
  };
}

async function replaceMotdLocales(motdId: string, bodies: MotdLocaleBodies) {
  await prisma.motdLocale.deleteMany({ where: { motdId } });
  const data = APP_LOCALES.filter((loc) => bodies[loc].trim().length > 0).map((locale) => ({
    motdId,
    locale,
    markdown: bodies[locale],
  }));
  if (data.length > 0) {
    await prisma.motdLocale.createMany({ data });
  }
}

function toTemplateDto(t: {
  id: string;
  name: string;
  description: string | null;
  markdownDe: string;
  markdownEn: string;
  markdownFr: string;
  markdownEs: string;
  markdownIt: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return AdminMotdTemplateDTOSchema.parse({
    id: t.id,
    name: t.name,
    description: t.description,
    markdownDe: t.markdownDe,
    markdownEn: t.markdownEn,
    markdownFr: t.markdownFr,
    markdownEs: t.markdownEs,
    markdownIt: t.markdownIt,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  });
}

function interactionStatsDto(
  row:
    | {
        contentVersion?: number;
        ackCount: number;
        thumbUp: number;
        thumbDown: number;
        dismissClose: number;
        dismissSwipe: number;
      }
    | null
    | undefined,
) {
  if (!row) {
    return { ackCount: 0, thumbUp: 0, thumbDown: 0, dismissClose: 0, dismissSwipe: 0 };
  }
  return {
    ackCount: row.ackCount,
    thumbUp: row.thumbUp,
    thumbDown: row.thumbDown,
    dismissClose: row.dismissClose,
    dismissSwipe: row.dismissSwipe,
  };
}

function interactionKey(motdId: string, contentVersion: number): string {
  return `${motdId}:${contentVersion}`;
}

async function fetchInteractionStats(motdId: string, contentVersion: number) {
  const row = await prisma.motdInteractionCounter.findUnique({
    where: {
      motdId_contentVersion: {
        motdId,
        contentVersion,
      },
    },
  });
  return interactionStatsDto(row);
}

async function fetchInteractionStatsMap(rows: Array<{ id: string; contentVersion: number }>) {
  if (rows.length <= 0) return new Map<string, ReturnType<typeof interactionStatsDto>>();
  const counters = await prisma.motdInteractionCounter.findMany({
    where: {
      OR: rows.map((row) => ({ motdId: row.id, contentVersion: row.contentVersion })),
    },
  });
  return new Map(
    counters.map((counter) => [
      interactionKey(counter.motdId, counter.contentVersion),
      interactionStatsDto(counter),
    ]),
  );
}

function toMotdListItem(m: {
  id: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  priority: number;
  startsAt: Date;
  endsAt: Date;
  visibleInArchive: boolean;
  contentVersion: number;
  templateId: string | null;
  updatedAt: Date;
  interaction?: {
    ackCount: number;
    thumbUp: number;
    thumbDown: number;
    dismissClose: number;
    dismissSwipe: number;
  } | null;
}) {
  return AdminMotdListItemDTOSchema.parse({
    id: m.id,
    status: m.status,
    priority: m.priority,
    startsAt: m.startsAt.toISOString(),
    endsAt: m.endsAt.toISOString(),
    visibleInArchive: m.visibleInArchive,
    contentVersion: m.contentVersion,
    templateId: m.templateId,
    updatedAt: m.updatedAt.toISOString(),
    interaction: interactionStatsDto(m.interaction),
  });
}

export const adminMotdRouter = router({
  templateList: adminProcedure.output(AdminMotdTemplateListOutputSchema).query(async () => {
    const rows = await prisma.motdTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      updatedAt: t.updatedAt.toISOString(),
    }));
  }),

  templateGet: adminProcedure
    .input(AdminMotdIdInputSchema)
    .output(AdminMotdTemplateDTOSchema)
    .query(async ({ input }) => {
      const t = await prisma.motdTemplate.findUnique({ where: { id: input.id } });
      if (t) {
        return toTemplateDto(t);
      }
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Vorlage nicht gefunden.' });
    }),

  templateCreate: adminProcedure
    .input(AdminMotdTemplateCreateInputSchema)
    .output(AdminMotdTemplateDTOSchema)
    .mutation(async ({ ctx, input }) => {
      const t = await prisma.motdTemplate.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          markdownDe: input.markdownDe,
          markdownEn: input.markdownEn,
          markdownFr: input.markdownFr,
          markdownEs: input.markdownEs,
          markdownIt: input.markdownIt,
        },
      });
      await logMotdAudit('MOTD_TEMPLATE_CREATE', t.id, ctx.adminToken, { templateName: t.name });
      return toTemplateDto(t);
    }),

  templateUpdate: adminProcedure
    .input(AdminMotdTemplateUpdateInputSchema)
    .output(AdminMotdTemplateDTOSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.motdTemplate.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Vorlage nicht gefunden.' });
      const t = await prisma.motdTemplate.update({
        where: { id: input.id },
        data: buildTemplateUpdateData(input),
      });
      await logMotdAudit('MOTD_TEMPLATE_UPDATE', t.id, ctx.adminToken);
      return toTemplateDto(t);
    }),

  templateDelete: adminProcedure
    .input(AdminMotdIdInputSchema)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.motdTemplate.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Vorlage nicht gefunden.' });
      await prisma.motdTemplate.delete({ where: { id: input.id } });
      await logMotdAudit('MOTD_TEMPLATE_DELETE', input.id, ctx.adminToken);
      return undefined;
    }),

  motdList: adminProcedure.output(AdminMotdListOutputSchema).query(async () => {
    const rows = await prisma.motd.findMany({
      orderBy: [{ updatedAt: 'desc' }],
    });
    const interactionMap = await fetchInteractionStatsMap(rows);
    return rows.map((row) =>
      toMotdListItem({
        ...row,
        interaction: interactionMap.get(interactionKey(row.id, row.contentVersion)) ?? null,
      }),
    );
  }),

  motdGet: adminProcedure
    .input(AdminMotdIdInputSchema)
    .output(AdminMotdDetailDTOSchema)
    .query(async ({ input }) => {
      const m = await prisma.motd.findUnique({
        where: { id: input.id },
        include: { locales: true },
      });
      if (!m) throw new TRPCError({ code: 'NOT_FOUND', message: 'MOTD nicht gefunden.' });
      const interaction = await fetchInteractionStats(m.id, m.contentVersion);
      return AdminMotdDetailDTOSchema.parse({
        id: m.id,
        status: m.status,
        priority: m.priority,
        startsAt: m.startsAt.toISOString(),
        endsAt: m.endsAt.toISOString(),
        visibleInArchive: m.visibleInArchive,
        contentVersion: m.contentVersion,
        templateId: m.templateId,
        locales: rowsToBodies(m.locales),
        interaction,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      });
    }),

  motdCreate: adminProcedure
    .input(AdminMotdCreateInputSchema)
    .output(AdminMotdDetailDTOSchema)
    .mutation(async ({ ctx, input }) => {
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);
      if (endsAt.getTime() <= startsAt.getTime()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'endsAt muss nach startsAt liegen.' });
      }
      if (input.templateId) {
        const tpl = await prisma.motdTemplate.findUnique({ where: { id: input.templateId } });
        if (!tpl) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Vorlage nicht gefunden.' });
      }
      const m = await prisma.motd.create({
        data: {
          status: input.status,
          priority: input.priority,
          startsAt,
          endsAt,
          visibleInArchive: input.visibleInArchive,
          contentVersion: 1,
          templateId: input.templateId ?? null,
        },
      });
      await replaceMotdLocales(m.id, input.locales);
      await logMotdAudit('MOTD_CREATE', m.id, ctx.adminToken, { status: input.status });
      if (input.status === 'PUBLISHED') {
        await logMotdAudit('MOTD_PUBLISH', m.id, ctx.adminToken);
      }
      const full = await prisma.motd.findUniqueOrThrow({
        where: { id: m.id },
        include: { locales: true },
      });
      const interaction = await fetchInteractionStats(full.id, full.contentVersion);
      return AdminMotdDetailDTOSchema.parse({
        id: full.id,
        status: full.status,
        priority: full.priority,
        startsAt: full.startsAt.toISOString(),
        endsAt: full.endsAt.toISOString(),
        visibleInArchive: full.visibleInArchive,
        contentVersion: full.contentVersion,
        templateId: full.templateId,
        locales: rowsToBodies(full.locales),
        interaction,
        createdAt: full.createdAt.toISOString(),
        updatedAt: full.updatedAt.toISOString(),
      });
    }),

  motdUpdate: adminProcedure
    .input(AdminMotdUpdateInputSchema)
    .output(AdminMotdDetailDTOSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.motd.findUnique({
        where: { id: input.id },
        include: { locales: true },
      });
      if (existing === null) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'MOTD nicht gefunden.' });
      }

      const { startsAt, endsAt } = resolveMotdTimeRange(
        existing.startsAt,
        existing.endsAt,
        input.startsAt,
        input.endsAt,
      );

      if (input.templateId !== undefined && input.templateId !== null) {
        const tpl = await prisma.motdTemplate.findUnique({ where: { id: input.templateId } });
        if (!tpl) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Vorlage nicht gefunden.' });
      }

      const nextLocales = input.locales;
      const oldBodies = rowsToBodies(existing.locales);
      const contentVersion = shouldIncrementMotdContentVersion(
        {
          contentVersion: existing.contentVersion,
          startsAt: existing.startsAt,
          endsAt: existing.endsAt,
          priority: existing.priority,
          locales: oldBodies,
        },
        {
          startsAt,
          endsAt,
          priority: input.priority,
          locales: nextLocales,
        },
      )
        ? existing.contentVersion + 1
        : existing.contentVersion;

      const prevPublished = existing.status === 'PUBLISHED';
      const nextStatus = input.status ?? existing.status;
      const nextArchive = input.visibleInArchive ?? existing.visibleInArchive;

      const m = await prisma.motd.update({
        where: { id: input.id },
        data: {
          ...buildMotdUpdateData(input),
          startsAt,
          endsAt,
          contentVersion,
        },
      });

      if (nextLocales !== undefined) {
        await replaceMotdLocales(m.id, nextLocales);
      }

      await logMotdAudit('MOTD_UPDATE', m.id, ctx.adminToken);
      if (!prevPublished && nextStatus === 'PUBLISHED') {
        await logMotdAudit('MOTD_PUBLISH', m.id, ctx.adminToken);
      }
      if (input.visibleInArchive !== undefined && nextArchive !== existing.visibleInArchive) {
        await logMotdAudit('MOTD_ARCHIVE_VISIBILITY', m.id, ctx.adminToken, {
          visibleInArchive: nextArchive,
        });
      }

      const full = await prisma.motd.findUniqueOrThrow({
        where: { id: m.id },
        include: { locales: true },
      });
      const interaction = await fetchInteractionStats(full.id, full.contentVersion);
      return AdminMotdDetailDTOSchema.parse({
        id: full.id,
        status: full.status,
        priority: full.priority,
        startsAt: full.startsAt.toISOString(),
        endsAt: full.endsAt.toISOString(),
        visibleInArchive: full.visibleInArchive,
        contentVersion: full.contentVersion,
        templateId: full.templateId,
        locales: rowsToBodies(full.locales),
        interaction,
        createdAt: full.createdAt.toISOString(),
        updatedAt: full.updatedAt.toISOString(),
      });
    }),

  motdDelete: adminProcedure
    .input(AdminMotdIdInputSchema)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.motd.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'MOTD nicht gefunden.' });
      await prisma.motd.delete({ where: { id: input.id } });
      await logMotdAudit('MOTD_DELETE', input.id, ctx.adminToken);
      return undefined;
    }),

  /** Setzt aggregierte Nutzerreaktionen der aktuellen contentVersion auf null – ohne contentVersion zu ändern. */
  motdResetInteractionStats: adminProcedure
    .input(AdminMotdIdInputSchema)
    .output(AdminMotdDetailDTOSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.motd.findUnique({ where: { id: input.id } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'MOTD nicht gefunden.' });
      await prisma.motdInteractionCounter.deleteMany({
        where: { motdId: input.id, contentVersion: existing.contentVersion },
      });
      await logMotdAudit('MOTD_RESET_INTERACTION_STATS', input.id, ctx.adminToken);
      const full = await prisma.motd.findUniqueOrThrow({
        where: { id: input.id },
        include: { locales: true },
      });
      const interaction = await fetchInteractionStats(full.id, full.contentVersion);
      return AdminMotdDetailDTOSchema.parse({
        id: full.id,
        status: full.status,
        priority: full.priority,
        startsAt: full.startsAt.toISOString(),
        endsAt: full.endsAt.toISOString(),
        visibleInArchive: full.visibleInArchive,
        contentVersion: full.contentVersion,
        templateId: full.templateId,
        locales: rowsToBodies(full.locales),
        interaction,
        createdAt: full.createdAt.toISOString(),
        updatedAt: full.updatedAt.toISOString(),
      });
    }),
});
