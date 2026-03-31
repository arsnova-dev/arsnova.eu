import { describe, it, expect } from 'vitest';
import type { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { MotdArchiveItemDTO } from '@arsnova/shared-types';
import { buildMotdArchiveItemDisplay } from './motd-archive-render.util';

const mockSanitizer = {
  bypassSecurityTrustHtml: (html: string) => html as unknown as SafeHtml,
} as DomSanitizer;

describe('buildMotdArchiveItemDisplay', () => {
  it('nutzt ATX-Überschrift als Titel und rendert Rumpf', () => {
    const it: MotdArchiveItemDTO = {
      id: 'a',
      markdown: '# Hallo\n\nText.',
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-02T00:00:00.000Z',
    };
    const r = buildMotdArchiveItemDisplay(it, mockSanitizer, 'Fallback');
    expect(r.title).toBe('Hallo');
    expect(String(r.html)).toContain('Text');
  });

  it('nutzt Fallback ohne führende Überschrift', () => {
    const it: MotdArchiveItemDTO = {
      id: 'b',
      markdown: 'Nur Fliesstext.',
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-02T00:00:00.000Z',
    };
    const r = buildMotdArchiveItemDisplay(it, mockSanitizer, 'FB');
    expect(r.title).toBe('FB');
  });
});
