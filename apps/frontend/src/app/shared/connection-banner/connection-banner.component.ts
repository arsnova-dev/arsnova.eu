/**
 * Banner bei WebSocket-Verbindungsabbruch (Story 4.3).
 * Zeigt Hinweis + automatischer Reconnect-Status.
 */
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { WsConnectionService } from '../../core/ws-connection.service';

@Component({
  selector: 'app-connection-banner',
  standalone: true,
  imports: [MatIcon],
  template: `
    @if (ws.disconnected()) {
      <div class="connection-banner" role="alert" aria-live="assertive">
        <mat-icon>wifi_off</mat-icon>
        <span>
          @if (ws.state() === 'reconnecting') {
            Verbindung unterbrochen – Reconnect läuft…
          } @else {
            Keine Verbindung zum Server
          }
        </span>
      </div>
    }
  `,
  styles: `
    .connection-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--mat-sys-error-container, #fce4ec);
      color: var(--mat-sys-on-error-container, #b71c1c);
      font: var(--mat-sys-label-large);
      text-align: center;
      z-index: 1000;
    }
  `,
})
export class ConnectionBannerComponent {
  protected readonly ws = inject(WsConnectionService);
}
