import { getLocaleFromPath, SUPPORTED_LOCALES, type SupportedLocale } from './locale-from-path';

type RouterCommand = string | number | boolean | Record<string, unknown>;

export function localizePath(path: string): string {
  const normalizedPath = normalizePath(path);
  const locale = getLocaleFromPath();

  if (!locale || hasLocalePrefix(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function localizeCommands(commands: readonly RouterCommand[]): RouterCommand[] {
  const normalizedCommands = normalizeCommands(commands);
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
