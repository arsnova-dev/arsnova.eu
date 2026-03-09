import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { trpc } from '../../core/trpc.client';
import { ThemePresetService } from '../../core/theme-preset.service';

interface VoteOption {
  value: string;
  label: string;
  icon?: string;
}

const MOOD_OPTIONS: VoteOption[] = [
  { value: 'POSITIVE', label: 'Gut', icon: '😊' },
  { value: 'NEUTRAL', label: 'Okay', icon: '😐' },
  { value: 'NEGATIVE', label: 'Schlecht', icon: '😟' },
];

const YESNO_OPTIONS: VoteOption[] = [
  { value: 'YES', label: 'Ja', icon: '👍' },
  { value: 'NO', label: 'Nein', icon: '👎' },
  { value: 'MAYBE', label: 'Vielleicht', icon: '🤷' },
];

const ABCD_OPTIONS: VoteOption[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];

const VOTER_ID_KEY = 'qf-voter-id';

function getOrCreateVoterId(): string {
  let id = localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

function votedStorageKey(code: string): string {
  return `qf-voted:${code}`;
}

@Component({
  selector: 'app-feedback-vote',
  standalone: true,
  imports: [MatButton, MatCard, MatCardContent, MatIcon],
  templateUrl: './feedback-vote.component.html',
  styleUrl: './feedback-vote.component.scss',
})
export class FeedbackVoteComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly themePreset = inject(ThemePresetService);
  private styleTimer: ReturnType<typeof setInterval> | null = null;
  private readonly voterId = getOrCreateVoterId();

  readonly code = this.route.snapshot.paramMap.get('code') ?? '';
  readonly voted = signal(!!localStorage.getItem(votedStorageKey(this.code)));
  readonly error = signal<string | null>(null);
  readonly feedbackType = signal<'MOOD' | 'ABCD' | 'YESNO' | null>(null);
  readonly loading = signal(true);

  readonly moodOptions = MOOD_OPTIONS;
  readonly yesnoOptions = YESNO_OPTIONS;
  readonly abcdOptions = ABCD_OPTIONS;

  constructor() {
    this.init();
  }

  ngOnDestroy(): void {
    if (this.styleTimer) {
      clearInterval(this.styleTimer);
      this.styleTimer = null;
    }
  }

  private async init(): Promise<void> {
    try {
      const result = await trpc.quickFeedback.results.query({ sessionCode: this.code });
      this.feedbackType.set(result.type as 'MOOD' | 'ABCD' | 'YESNO');
      this.applyStyle(result.theme, result.preset);
      this.loading.set(false);
      this.styleTimer = setInterval(() => this.pollStyle(), 3000);
    } catch {
      this.error.set('Feedback-Runde nicht gefunden oder abgelaufen.');
      this.loading.set(false);
    }
  }

  private async pollStyle(): Promise<void> {
    try {
      const result = await trpc.quickFeedback.results.query({ sessionCode: this.code });
      this.applyStyle(result.theme, result.preset);
    } catch {
      // Polling is best-effort
    }
  }

  private applyStyle(theme: string, preset: string): void {
    if (theme === 'dark' || theme === 'light' || theme === 'system') {
      this.themePreset.setTheme(theme);
    }
    if (preset === 'serious' || preset === 'spielerisch') {
      this.themePreset.setPreset(preset, { silent: true });
    }
  }

  async vote(value: string): Promise<void> {
    try {
      await trpc.quickFeedback.vote.mutate({
        sessionCode: this.code,
        voterId: this.voterId,
        value,
      });
      this.voted.set(true);
      localStorage.setItem(votedStorageKey(this.code), '1');
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      if (message.includes('bereits abgestimmt')) {
        this.voted.set(true);
        localStorage.setItem(votedStorageKey(this.code), '1');
      } else {
        this.error.set('Abstimmung fehlgeschlagen.');
      }
    }
  }
}
