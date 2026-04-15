import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { QuizSyncComponent } from './quiz-sync.component';
import { QuizStoreService } from '../data/quiz-store.service';

describe('QuizSyncComponent', () => {
  const mockStore = {
    activateSyncRoom: vi.fn(),
    syncConnectionState: signal<'connected' | 'connecting' | 'disconnected'>('connected'),
    syncPeerInfos: signal<Array<{ deviceId: string; deviceLabel: string; browserLabel: string }>>(
      [],
    ),
    syncRoomId: signal('sync-room-12345678'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.syncConnectionState.set('connected');
    mockStore.syncPeerInfos.set([]);
    TestBed.configureTestingModule({
      imports: [QuizSyncComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ docId: 'sync-room-12345678' }),
            },
          },
        },
        { provide: QuizStoreService, useValue: mockStore },
      ],
    });
  });

  it('aktiviert den gewünschten Sync-Raum und zeigt Teilen-Oberflaeche', () => {
    const fixture = TestBed.createComponent(QuizSyncComponent);
    fixture.detectChanges();

    expect(mockStore.activateSyncRoom).toHaveBeenCalledWith('sync-room-12345678', {
      markShared: true,
      registerOrigin: true,
    });
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Quiz-Sammlung teilen');
    expect(text).toContain('Sync-Link kopieren');
    expect(text).toContain('Status:');
    expect(text).toContain('Bereit');
  });

  it('zeigt erst "Verbunden", wenn ein weiteres Gerät aktiv ist', () => {
    mockStore.syncConnectionState.set('connected');
    mockStore.syncPeerInfos.set([
      { deviceId: 'peer-1', deviceLabel: 'iPhone', browserLabel: 'Safari' },
    ]);

    const fixture = TestBed.createComponent(QuizSyncComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Verbunden');
  });
});
