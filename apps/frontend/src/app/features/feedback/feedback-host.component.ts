import { Component, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { trpc } from '../../core/trpc.client';
import { ThemePresetService } from '../../core/theme-preset.service';
import type { QuickFeedbackResult } from '@arsnova/shared-types';
import type { Unsubscribable } from '@trpc/server/observable';
import QRCode from 'qrcode';

@Component({
  selector: 'app-feedback-host',
  standalone: true,
  imports: [KeyValuePipe, MatCard, MatCardContent],
  templateUrl: './feedback-host.component.html',
  styleUrl: './feedback-host.component.scss',
})
export class FeedbackHostComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly themePreset = inject(ThemePresetService);
  private subscription: Unsubscribable | null = null;

  readonly code = this.route.snapshot.paramMap.get('code') ?? '';
  readonly result = signal<QuickFeedbackResult | null>(null);
  readonly qrDataUrl = signal<string>('');
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const theme = this.themePreset.theme();
      const preset = this.themePreset.preset();
      if (this.code) {
        trpc.quickFeedback.updateStyle.mutate({
          sessionCode: this.code,
          theme,
          preset,
        }).catch(() => {});
      }
    });
  }

  get joinUrl(): string {
    const base = globalThis.location?.origin ?? '';
    return `${base}/feedback/${this.code}/vote`;
  }

  async ngOnInit(): Promise<void> {
    this.generateQrCode();
    this.subscribeToResults();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  private subscribeToResults(): void {
    this.subscription = trpc.quickFeedback.onResults.subscribe(
      { sessionCode: this.code },
      {
        onData: (data) => {
          this.result.set(data);
          this.error.set(null);
        },
        onError: () => {
          this.error.set('Feedback-Runde nicht gefunden oder abgelaufen.');
        },
      },
    );
  }

  private async generateQrCode(): Promise<void> {
    try {
      const url = await QRCode.toDataURL(this.joinUrl, { width: 280, margin: 2 });
      this.qrDataUrl.set(url);
    } catch {
      // QR code generation is best-effort
    }
  }

  maxVotes(): number {
    const dist = this.result()?.distribution;
    if (!dist) return 1;
    return Math.max(1, ...Object.values(dist));
  }

  percentage(count: number): number {
    const total = this.result()?.totalVotes ?? 0;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  barWidth(count: number): number {
    const max = this.maxVotes();
    return Math.round((count / max) * 100);
  }

  displayLabel(key: string, type: string): string {
    if (type === 'MOOD') {
      switch (key) {
        case 'POSITIVE': return '😊';
        case 'NEUTRAL': return '😐';
        case 'NEGATIVE': return '😟';
      }
    }
    if (type === 'YESNO') {
      switch (key) {
        case 'YES': return '👍';
        case 'NO': return '👎';
        case 'MAYBE': return '🤷';
      }
    }
    return key;
  }

  feedbackTitle(type: string): string {
    switch (type) {
      case 'MOOD': return 'Stimmungsbild';
      case 'YESNO': return 'Ja / Nein / Vielleicht';
      case 'ABCD': return 'ABCD-Voting';
      default: return 'Feedback';
    }
  }
}
