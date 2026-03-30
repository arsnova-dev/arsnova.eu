import { DatePipe, DecimalPipe, DOCUMENT } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import type { BonusTokenListWithSessionMetaDTO } from '@arsnova/shared-types';
import { trpc } from '../../../core/trpc.client';

export interface BonusCodesDialogData {
  serverQuizId: string;
  quizName: string;
}

@Component({
  selector: 'app-bonus-codes-dialog',
  standalone: true,
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatProgressSpinner,
    DecimalPipe,
    DatePipe,
  ],
  templateUrl: './bonus-codes-dialog.component.html',
  styleUrls: [
    '../../../shared/styles/dialog-title-header.scss',
    './bonus-codes-dialog.component.scss',
  ],
})
export class BonusCodesDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<BonusCodesDialogComponent>);
  private readonly document = inject(DOCUMENT);
  readonly data = inject<BonusCodesDialogData>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly sessions = signal<BonusTokenListWithSessionMetaDTO[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const result = await trpc.session.getBonusTokensForQuiz.query({
        quizId: this.data.serverQuizId,
      });
      this.sessions.set(result.sessions);
    } catch {
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  exportAllCsv(): void {
    const sessions = this.sessions();
    if (sessions.length === 0) return;
    const header = 'Session;Rang;Nickname;Code;Punkte;Generiert am';
    const rows: string[] = [header];
    for (const s of sessions) {
      for (const t of s.tokens) {
        rows.push(
          `${s.sessionCode};${t.rank};${t.nickname};${t.token};${t.totalScore};${t.generatedAt}`,
        );
      }
    }
    const csv = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = url;
    a.download = `bonus-codes-${this.data.quizName.replace(/[^\wäöüÄÖÜß.-]+/gi, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
