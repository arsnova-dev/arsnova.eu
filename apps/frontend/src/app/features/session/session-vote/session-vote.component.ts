import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { trpc } from '../../../core/trpc.client';
import { renderMarkdownWithKatex } from '../../../shared/markdown-katex.util';
import type { SessionStatus, QuestionStudentDTO, QuestionPreviewDTO, QuestionRevealedDTO } from '@arsnova/shared-types';
import type { Unsubscribable } from '@trpc/server/observable';

const PARTICIPANT_STORAGE_KEY = 'arsnova-participant';

type CurrentQuestion = QuestionStudentDTO | QuestionPreviewDTO | QuestionRevealedDTO;

const ANSWER_COLORS = ['#1565c0', '#e65100', '#2e7d32', '#6a1b9a', '#c62828', '#00838f', '#4e342e', '#37474f'];
const ANSWER_SHAPES = ['\u25B3', '\u25CB', '\u25A1', '\u25C7', '\u2606', '\u2B21', '\u2B20', '\u2BC6'];

@Component({
  selector: 'app-session-vote',
  standalone: true,
  imports: [MatButton, MatIcon, MatProgressSpinner],
  templateUrl: './session-vote.component.html',
  styleUrl: './session-vote.component.scss',
})
export class SessionVoteComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private statusSub: Unsubscribable | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly code = (this.route.parent?.snapshot.paramMap.get('code') ?? '').toUpperCase();
  readonly sessionId = signal('');
  readonly participantId = signal('');
  readonly status = signal<SessionStatus>('LOBBY');
  readonly currentQuestion = signal<CurrentQuestion | null>(null);

  readonly selectedAnswerIds = signal<Set<string>>(new Set());
  readonly voteSent = signal(false);
  readonly voteError = signal<string | null>(null);
  readonly voteSending = signal(false);
  readonly freeTextValue = signal('');
  readonly debounced = signal(false);
  readonly countdownSeconds = signal<number | null>(null);
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  readonly isActive = computed(() => this.status() === 'ACTIVE');
  readonly isQuestionOpen = computed(() => this.status() === 'QUESTION_OPEN');
  readonly isResults = computed(() => this.status() === 'RESULTS');
  readonly isLobby = computed(() => this.status() === 'LOBBY');
  readonly isFinished = computed(() => this.status() === 'FINISHED');

  readonly hasAnswers = computed(() => {
    const q = this.currentQuestion();
    return q && 'answers' in q && Array.isArray(q.answers) && q.answers.length > 0;
  });

  getColor(index: number): string { return ANSWER_COLORS[index % ANSWER_COLORS.length]; }
  getShape(index: number): string { return ANSWER_SHAPES[index % ANSWER_SHAPES.length]; }
  getLetter(index: number): string { return String.fromCharCode(65 + index); }

  renderMarkdown(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(renderMarkdownWithKatex(value).html);
  }

  async ngOnInit(): Promise<void> {
    if (!this.code) return;

    if (typeof localStorage !== 'undefined') {
      this.participantId.set(localStorage.getItem(`${PARTICIPANT_STORAGE_KEY}-${this.code}`) ?? '');
    }

    try {
      const session = await trpc.session.getInfo.query({ code: this.code });
      this.sessionId.set(session.id);
      this.status.set(session.status as SessionStatus);
    } catch { /* Parent-Shell hat schon validiert */ }

    this.statusSub = trpc.session.onStatusChanged.subscribe(
      { code: this.code },
      {
        onData: (data) => {
          this.status.set(data.status as SessionStatus);
          void this.refreshQuestion();
        },
      },
    );

    void this.refreshQuestion();
    this.pollTimer = setInterval(() => void this.refreshQuestion(), 2000);
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
    this.statusSub = null;
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    this.stopCountdown();
  }

  private startCountdown(q: CurrentQuestion | null): void {
    this.stopCountdown();
    if (!q || !('timer' in q) || !q.timer || q.timer <= 0) {
      this.countdownSeconds.set(null);
      return;
    }
    let remaining = q.timer;
    this.countdownSeconds.set(remaining);
    this.countdownTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        this.countdownSeconds.set(0);
        this.stopCountdown();
      } else {
        this.countdownSeconds.set(remaining);
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
  }

  private async refreshQuestion(): Promise<void> {
    try {
      const q = await trpc.session.getCurrentQuestionForStudent.query({ code: this.code });
      const prev = this.currentQuestion();
      const prevId = prev && 'id' in prev ? prev.id : null;
      const newId = q && 'id' in q ? q.id : null;
      if (newId !== prevId) {
        this.selectedAnswerIds.set(new Set());
        this.voteSent.set(false);
        this.voteError.set(null);
        this.freeTextValue.set('');
        this.startCountdown(q);
      }
      this.currentQuestion.set(q);
    } catch { /* noop */ }
  }

  toggleAnswer(answerId: string): void {
    if (this.voteSent() || this.debounced() || !this.isActive()) return;
    const q = this.currentQuestion();
    if (!q || !('type' in q)) return;
    const set = new Set(this.selectedAnswerIds());

    if (q.type === 'SINGLE_CHOICE') {
      this.selectedAnswerIds.set(new Set([answerId]));
      void this.submitVote([answerId]);
      return;
    }

    if (set.has(answerId)) set.delete(answerId); else set.add(answerId);
    this.selectedAnswerIds.set(set);
  }

  async submitVote(overrideIds?: string[]): Promise<void> {
    if (this.voteSending() || this.voteSent() || this.debounced()) return;
    const q = this.currentQuestion();
    if (!q || !('id' in q)) return;

    const answerIds = overrideIds ?? [...this.selectedAnswerIds()];
    const freeText = q.type === 'FREETEXT' ? this.freeTextValue().trim() : undefined;

    this.debounced.set(true);
    this.voteSending.set(true);
    this.voteError.set(null);

    try {
      await trpc.vote.submit.mutate({
        sessionId: this.sessionId(),
        participantId: this.participantId(),
        questionId: q.id,
        answerIds: answerIds.length > 0 ? answerIds : undefined,
        freeText: freeText || undefined,
      });
      this.voteSent.set(true);
      try { navigator.vibrate?.(10); } catch { /* unsupported */ }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Abstimmung fehlgeschlagen.';
      this.voteError.set(msg);
      if (!overrideIds) this.selectedAnswerIds.set(new Set());
    } finally {
      this.voteSending.set(false);
      setTimeout(() => this.debounced.set(false), 300);
    }
  }
}
