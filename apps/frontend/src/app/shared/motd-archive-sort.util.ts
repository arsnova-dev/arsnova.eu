import type { MotdArchiveItemDTO } from '@arsnova/shared-types';

function safeTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Sortierung fürs UI: antichronologisch (neueste zuerst) nach Veröffentlichungsdatum (`startsAt`).
 * Fallbacks: `endsAt` DESC, dann `id` DESC (stabil für Pagination/SSR-Snapshots).
 */
export function sortMotdArchiveItemsNewFirst(items: MotdArchiveItemDTO[]): MotdArchiveItemDTO[] {
  return [...items].sort((a, b) => {
    const sa = safeTime(a.startsAt);
    const sb = safeTime(b.startsAt);
    if (sb !== sa) return sb - sa;
    const ea = safeTime(a.endsAt);
    const eb = safeTime(b.endsAt);
    if (eb !== ea) return eb - ea;
    if (b.id !== a.id) return b.id < a.id ? -1 : 1;
    return 0;
  });
}
