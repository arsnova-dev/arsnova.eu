/**
 * Liest die aktuelle Locale aus dem ersten URL-Segment (z. B. /en/... → "en").
 * Wird für Legal-Seiten und Toolbar verwendet.
 */
export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'it', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_REGEX = /^\/(de|en|fr|it|es)(?:\/|$)/;

export function getLocaleFromPath(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(LOCALE_REGEX);
  return match ? (match[1] as SupportedLocale) : null;
}
