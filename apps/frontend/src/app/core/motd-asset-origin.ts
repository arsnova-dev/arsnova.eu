/**
 * SSR/Prerender-Fallback für MOTD-Bilder ohne Browser-Kontext.
 * Im Browser wird bevorzugt die aktuelle `base href` genutzt, damit lokalisierte Builds
 * konsistent `/<locale>/assets/...` auflösen und nicht auf eine harte Root-URL festgelegt sind.
 */
export const DEFAULT_MOTD_PUBLIC_BASE = 'https://arsnova.eu/';

/**
 * Basis-URL für MOTD-Bilder in `[innerHTML]`.
 * Browser: aktuelle `base href` (z. B. `https://arsnova.eu/de/`),
 * SSR/Prerender: kanonische Produktionsbasis.
 */
export function resolveMotdAssetOrigin(): string {
  if (typeof document !== 'undefined') {
    const rawBase = (document.querySelector('base')?.getAttribute('href') ?? '/').trim();
    if (rawBase) {
      const origin =
        typeof globalThis !== 'undefined' && 'location' in globalThis
          ? (globalThis as { location?: { origin?: string } }).location?.origin
          : undefined;
      try {
        return new URL(rawBase, origin ?? DEFAULT_MOTD_PUBLIC_BASE).href.replace(/\/+$/, '');
      } catch {
        /* fallback below */
      }
    }
  }

  if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
    const fallbackOrigin = (globalThis as { location?: { origin?: string } }).location?.origin;
    if (fallbackOrigin && /^https?:\/\//i.test(fallbackOrigin)) {
      return fallbackOrigin.replace(/\/+$/, '');
    }
  }

  return DEFAULT_MOTD_PUBLIC_BASE.replace(/\/+$/, '');
}
