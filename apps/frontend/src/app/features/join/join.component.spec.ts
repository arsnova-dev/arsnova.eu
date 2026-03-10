/**
 * Unit-Tests für JoinComponent (Story 3.1: Code validieren, Lobby/Fehler anzeigen).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { JoinComponent } from './join.component';
import { trpc } from '../../core/trpc.client';

const mockSession = {
  id: 'sess-1',
  code: 'ABC123',
  type: 'QUIZ' as const,
  status: 'LOBBY' as const,
  quizName: 'Test-Quiz',
  title: null as string | null,
  participantCount: 5,
};

vi.mock('../../core/trpc.client', () => ({
  trpc: {
    session: {
      getInfo: {
        query: vi.fn().mockResolvedValue({
          id: 'sess-1',
          code: 'ABC123',
          type: 'QUIZ',
          status: 'LOBBY',
          quizName: 'Test-Quiz',
          title: null,
          participantCount: 5,
        }),
      },
    },
  },
}));

describe('JoinComponent', () => {
  beforeEach(() => {
    vi.mocked(trpc.session.getInfo.query).mockResolvedValue(mockSession);
    TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (key: string) => (key === 'code' ? 'ABC123' : null) } },
          },
        },
      ],
    });
  });

  function createWithCode(code: string): { fixture: ReturnType<typeof TestBed.createComponent<JoinComponent>>; comp: JoinComponent } {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: { paramMap: { get: (key: string) => (key === 'code' ? code : null) } },
      },
    });
    const fixture = TestBed.createComponent(JoinComponent);
    const comp = fixture.componentInstance;
    return { fixture, comp };
  }

  it('lädt Session bei gültigem 6-stelligen Code', async () => {
    const { fixture, comp } = createWithCode('ABC123');
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 50));

    expect(comp.session()).toEqual(mockSession);
    expect(comp.error()).toBeNull();
    expect(comp.loading()).toBe(false);
  });

  it('zeigt Fehler bei ungültigem Code (zu kurz)', async () => {
    const { fixture, comp } = createWithCode('AB');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(comp.error()).toBe('Ungültiger Session-Code.');
    expect(comp.session()).toBeNull();
    expect(comp.loading()).toBe(false);
  });

  it('zeigt Fehlermeldung wenn getInfo fehlschlägt', async () => {
    vi.mocked(trpc.session.getInfo.query).mockRejectedValueOnce(new Error('Session nicht gefunden.'));

    const { fixture, comp } = createWithCode('XYZ999'); // 6 Zeichen, damit getInfo aufgerufen wird
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 80));

    expect(comp.error()).toBe('Session nicht gefunden.');
    expect(comp.session()).toBeNull();
  });

  it('zeigt Fehler wenn Session FINISHED', async () => {
    vi.mocked(trpc.session.getInfo.query).mockResolvedValue({ ...mockSession, status: 'FINISHED' as const });

    const { fixture, comp } = createWithCode('ABC123');
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 80));

    expect(comp.error()).toBe('Diese Session ist bereits beendet.');
    expect(comp.session()).toBeNull();
  });
});
