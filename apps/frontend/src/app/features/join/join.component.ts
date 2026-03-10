import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { trpc } from '../../core/trpc.client';
import type { SessionInfoDTO } from '@arsnova/shared-types';

/**
 * Teilnehmer-Einstieg (QR/Link). Code validieren → Lobby (Story 3.1). Nickname (3.2) → session/:code/vote.
 * Story 2.1b, 3.1, 3.2, 3.6, 7.1.
 */
@Component({
  selector: 'app-join',
  standalone: true,
  imports: [MatCard, MatCardContent, MatButton],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss',
})
export class JoinComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly code = (this.route.snapshot.paramMap.get('code') ?? '').trim().toUpperCase();

  readonly session = signal<SessionInfoDTO | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    if (this.code.length !== 6) {
      this.error.set('Ungültiger Session-Code.');
      this.loading.set(false);
      return;
    }
    void this.loadSession();
  }

  private async loadSession(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const session = await trpc.session.getInfo.query({ code: this.code });
      if (session.status === 'FINISHED') {
        this.error.set('Diese Session ist bereits beendet.');
        this.loading.set(false);
        return;
      }
      this.session.set(session);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
        ? (err as { message: string }).message
        : 'Session nicht gefunden.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
