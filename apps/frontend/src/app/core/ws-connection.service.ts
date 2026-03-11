/**
 * WebSocket-Verbindungsstatus als Angular Signal (Story 4.3).
 * Exponential Backoff wird in trpc.client.ts konfiguriert.
 */
import { Injectable, OnDestroy, signal } from '@angular/core';
import { type WsConnectionState, getWsConnectionState, onWsStateChange } from './trpc.client';

@Injectable({ providedIn: 'root' })
export class WsConnectionService implements OnDestroy {
  readonly state = signal<WsConnectionState>(getWsConnectionState());
  readonly disconnected = signal(false);
  private readonly unsubscribe: () => void;

  constructor() {
    this.unsubscribe = onWsStateChange((s) => {
      this.state.set(s);
      this.disconnected.set(s !== 'connected');
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
