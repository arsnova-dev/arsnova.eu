import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { trpc } from '../../core/trpc.client';
import type { SessionInfoDTO } from '@arsnova/shared-types';

/**
 * Session-Seite (Epic 2 + 3).
 * Platzhalter – zeigt Session-Info per Code an.
 * Wird mit Story 2.2 (Lobby), 2.3 (Steuerung), 3.1 (Beitreten) erweitert.
 */
@Component({
  selector: 'app-session',
  imports: [RouterLink, MatButton, MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatIcon],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {
  session = signal<SessionInfoDTO | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    if (code.length !== 6) {
      this.error.set('Ungültiger Code.');
      this.loading.set(false);
      return;
    }
    try {
      const info = await trpc.health.check.query();
      if (info.status !== 'ok') throw new Error('Backend nicht erreichbar');
      const session = await trpc.session.getInfo.query({ code: code.toUpperCase() });
      this.session.set(session);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Nicht gefunden. Code prüfen oder neu eingeben.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
