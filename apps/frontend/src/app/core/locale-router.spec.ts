import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocaleFromPath } from './locale-from-path';
import { localizeCommands, localizePath } from './locale-router';

vi.mock('./locale-from-path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./locale-from-path')>();
  return {
    ...actual,
    getLocaleFromPath: vi.fn(actual.getLocaleFromPath),
  };
});

describe('locale-router', () => {
  afterEach(() => {
    document.querySelectorAll('base').forEach((el) => el.remove());
  });

  describe('mit <base href="/de/"> (localized Production)', () => {
    beforeEach(() => {
      const base = document.createElement('base');
      base.setAttribute('href', '/de/');
      document.head.prepend(base);
      vi.mocked(getLocaleFromPath).mockReturnValue('de');
    });

    it('localizePath: kein doppeltes Locale-Segment', () => {
      expect(localizePath('/legal/privacy')).toBe('/legal/privacy');
      expect(localizePath('/')).toBe('/');
    });

    it('localizePath: entfernt führendes Locale falls vorhanden', () => {
      expect(localizePath('/de/legal/privacy')).toBe('/legal/privacy');
    });

    it('localizeCommands: kein prepend von de', () => {
      expect(localizeCommands(['quiz', 'abc'])).toEqual(['quiz', 'abc']);
    });

    it('localizeCommands: entfernt führendes Locale-Segment', () => {
      expect(localizeCommands(['de', 'quiz', 'abc'])).toEqual(['quiz', 'abc']);
    });
  });

  describe('mit <base href="/"> (Dev)', () => {
    beforeEach(() => {
      const base = document.createElement('base');
      base.setAttribute('href', '/');
      document.head.prepend(base);
      vi.mocked(getLocaleFromPath).mockReturnValue('de');
    });

    it('localizePath: Locale voranstellen', () => {
      expect(localizePath('/legal/privacy')).toBe('/de/legal/privacy');
      expect(localizePath('/')).toBe('/de');
    });

    it('localizeCommands: Locale voranstellen', () => {
      expect(localizeCommands(['quiz', 'x'])).toEqual(['de', 'quiz', 'x']);
    });
  });
});
