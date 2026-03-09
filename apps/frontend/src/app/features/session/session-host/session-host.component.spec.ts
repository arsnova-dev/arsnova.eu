import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionHostComponent } from './session-host.component';

const { getInfoQueryMock, getLiveFreetextQueryMock } = vi.hoisted(() => ({
  getInfoQueryMock: vi.fn(),
  getLiveFreetextQueryMock: vi.fn(),
}));

vi.mock('../../../core/trpc.client', () => ({
  trpc: {
    session: {
      getInfo: {
        query: getInfoQueryMock,
      },
      getLiveFreetext: {
        query: getLiveFreetextQueryMock,
      },
    },
  },
}));

describe('SessionHostComponent', () => {
  beforeEach(() => {
    getInfoQueryMock.mockResolvedValue({
      id: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
      code: 'ABC123',
      type: 'QUIZ',
      status: 'ACTIVE',
      quizName: 'Demo Quiz',
      title: null,
      participantCount: 12,
    });
    getLiveFreetextQueryMock.mockResolvedValue({
      sessionId: '6a8edced-5f8f-4cfa-9176-454fac9570ad',
      questionId: '7ed3cc25-3179-4a91-9dc3-acc00971fb46',
      questionOrder: 0,
      questionType: 'FREETEXT',
      questionText: 'Was war hilfreich?',
      responses: ['Klare Struktur'],
      updatedAt: '2026-03-08T12:00:00.000Z',
    });

    TestBed.configureTestingModule({
      imports: [SessionHostComponent],
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

  it('zeigt Session-Metadaten und Word-Cloud in der Host-Ansicht', async () => {
    const fixture = TestBed.createComponent(SessionHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('ABC123');
    expect(text).toContain('Word-Cloud');
    expect(getLiveFreetextQueryMock).toHaveBeenCalled();

    fixture.destroy();
  });
});
