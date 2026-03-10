import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { trpc } from '../../core/trpc.client';
import type { SessionInfoDTO } from '@arsnova/shared-types';
import type { NicknameTheme } from '@arsnova/shared-types';
import { NICKNAME_LISTS } from './nickname-themes';

const PARTICIPANT_STORAGE_KEY = 'arsnova-participant';

/**
 * Teilnehmer-Einstieg (QR/Link). Code validieren → Lobby (Story 3.1). Nickname (3.2) → session/:code/vote.
 * Story 2.1b, 3.1, 3.2, 3.6, 7.1.
 */
@Component({
  selector: 'app-join',
  standalone: true,
  imports: [MatCard, MatCardContent, MatButton, MatFormField, MatLabel, MatInput, MatSelect, MatOption],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss',
})
export class JoinComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly code = (this.route.snapshot.paramMap.get('code') ?? '').trim().toUpperCase();

  readonly session = signal<SessionInfoDTO | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  /** Bereits vergebene Nicknames (für Ausgrauen). */
  readonly takenNicknames = signal<Set<string>>(new Set());
  readonly selectedNickname = signal<string>('');
  readonly customNickname = signal('');
  readonly joining = signal(false);

  /** Theme-Liste für QUIZ mit nicknameTheme; sonst leer. */
  readonly nicknameOptions = computed(() => {
    const s = this.session();
    if (!s || s.type !== 'QUIZ' || !s.nicknameTheme) return [];
    return NICKNAME_LISTS[s.nicknameTheme as NicknameTheme] as string[];
  });

  readonly canSubmit = computed(() => {
    const sel = this.selectedNickname().trim();
    const custom = this.customNickname().trim();
    const allowCustom = this.session()?.allowCustomNicknames ?? true;
    return (sel.length > 0) || (allowCustom && custom.length > 0);
  });

  readonly effectiveNickname = computed(() => {
    const custom = this.customNickname().trim();
    if (custom.length > 0) return custom;
    return this.selectedNickname().trim();
  });

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
      await this.loadParticipants();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
        ? (err as { message: string }).message
        : 'Session nicht gefunden.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadParticipants(): Promise<void> {
    try {
      const payload = await trpc.session.getParticipants.query({ code: this.code });
      const set = new Set(payload.participants.map((p) => p.nickname.trim().toLowerCase()));
      this.takenNicknames.set(set);
    } catch {
      this.takenNicknames.set(new Set());
    }
  }

  isTaken(nickname: string): boolean {
    return this.takenNicknames().has(nickname.trim().toLowerCase());
  }

  async submitJoin(): Promise<void> {
    if (this.joining() || !this.canSubmit()) return;
    const nickname = this.effectiveNickname();
    if (!nickname || nickname.length > 30) return;
    this.error.set(null);
    this.joining.set(true);
    try {
      const result = await trpc.session.join.mutate({ code: this.code, nickname: nickname.slice(0, 30) });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${PARTICIPANT_STORAGE_KEY}-${this.code}`, result.participantId);
      }
      await this.router.navigate(['/session', this.code, 'vote']);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
        ? (err as { message: string }).message
        : 'Beitritt fehlgeschlagen.';
      this.error.set(msg);
    } finally {
      this.joining.set(false);
    }
  }
}
