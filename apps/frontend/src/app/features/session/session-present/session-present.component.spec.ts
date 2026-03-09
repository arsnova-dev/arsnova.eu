import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { SessionPresentComponent } from './session-present.component';

const { liveQueryMock } = vi.hoisted(() => ({
  liveQueryMock: vi.fn(),
}));

vi.mock('../../../core/trpc.client', () => ({
  trpc: {
    session: {
      getLiveFreetext: {
        query: liveQueryMock,
      },
    },
  },
}));

describe('SessionPresentComponent', () => {
  beforeEach(() => {
    liveQueryMock.mockResolvedValue({
      sessionId: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
      questionId: '7ed3cc25-3179-4a91-9dc3-acc00971fb46',
      questionOrder: 1,
      questionType: 'FREETEXT',
      questionText: 'Was war hilfreich?',
      responses: ['Klare Struktur'],
      updatedAt: '2026-03-08T12:00:00.000Z',
    });

    TestBed.configureTestingModule({
      imports: [SessionPresentComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                paramMap: convertToParamMap({ code: 'ABC123' }),
              },
            },
          },
        },
      ],
    });
  });

  it('rendert die Word-Cloud in der Presenter-Ansicht mit Live-Hinweis', async () => {
    const fixture = TestBed.createComponent(SessionPresentComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Word-Cloud');
    expect(text).toContain('Live-Freitext');
    expect(text).toContain('Frage 2');
    fixture.destroy();
  });
});
