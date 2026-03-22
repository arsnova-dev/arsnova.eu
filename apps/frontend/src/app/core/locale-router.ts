import { getLocaleFromPath, SUPPORTED_LOCALES, type SupportedLocale } from './locale-from-path';

type RouterCommand = string | number | boolean | Record<string, unknown>;

/**
 * Localized Production-Build: &lt;base href="/de/"&gt; (pro Sprache).
 * Dann steckt die Locale schon in der Basis-URL; Router-Links dürfen kein zweites /de/ bekommen.
 */
function getLocaleFromBaseHref(): SupportedLocale | null {
  if (typeof document === 'undefined') return null;
  const raw = (document.querySelector('base')?.getAttribute('href') ?? '/').trim();
  const normalized = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  if (normalized === '' || normalized === '/') return null;
  const m = normalized.match(/^\/(de|en|fr|it|es)$/);
  return m ? (m[1] as SupportedLocale) : null;
}

function stripLeadingLocaleFromPath(path: string): string {
  const without = path.replace(new RegExp(`^/(?:${SUPPORTED_LOCALES.join('|')})(?=/|$)`), '');
  if (without === '') return '/';
  return without.startsWith('/') ? without : `/${without}`;
}

export function localizePath(path: string): string {
  const normalizedPath = normalizePath(path);
  const baseLocale = getLocaleFromBaseHref();

  if (baseLocale) {
    return stripLeadingLocaleFromPath(normalizedPath);
  }

  const locale = getLocaleFromPath();

  if (!locale || hasLocalePrefix(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function localizeCommands(commands: readonly RouterCommand[]): RouterCommand[] {
  const normalizedCommands = normalizeCommands(commands);
  const baseLocale = getLocaleFromBaseHref();

  if (baseLocale) {
    if (isSupportedLocale(normalizedCommands[0])) {
      return normalizedCommands.slice(1);
    }
    return normalizedCommands;
  }

  const locale = getLocaleFromPath();

  if (!locale || isSupportedLocale(normalizedCommands[0])) {
    return normalizedCommands;
  }

  return [locale, ...normalizedCommands];
}

function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/');
}

function normalizeCommands(commands: readonly RouterCommand[]): RouterCommand[] {
  const normalizedCommands: RouterCommand[] = [];

  commands.forEach((command, index) => {
    if (typeof command !== 'string') {
      normalizedCommands.push(command);
      return;
    }

    if (index !== 0) {
      normalizedCommands.push(command);
      return;
    }

    const trimmed = command.trim();
    const cleaned = trimmed.replace(/^\/+|\/+$/g, '');
    if (!cleaned) {
      return;
    }

    cleaned.split('/').forEach((segment) => normalizedCommands.push(segment));
  });

  return normalizedCommands;
}

function hasLocalePrefix(path: string): boolean {
  return new RegExp(`^/(?:${SUPPORTED_LOCALES.join('|')})(?:/|$)`).test(path);
}

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as SupportedLocale);
}
