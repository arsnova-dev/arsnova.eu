import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';
import { LiveSessionDialogComponent } from './live-session-dialog.component';

describe('LiveSessionDialogComponent', () => {
  it('aktiviert standardmaessig alle drei Bereiche', () => {
    TestBed.configureTestingModule({
      imports: [LiveSessionDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            quizName: 'Deep Learning Quiz',
            quizCanStart: true,
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(LiveSessionDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.enableQuiz()).toBe(true);
    expect(component.enableQa()).toBe(true);
    expect(component.enableQuickFeedback()).toBe(true);
    expect(component.startChannel()).toBe('quiz');
    expect(component.channelStateLabel('quiz')).toBe('Start');
    expect(component.channelStateLabel('qa')).toBe('An');
    expect(fixture.nativeElement.textContent).not.toContain('Zusätzlich aktivieren');
    expect(fixture.nativeElement.textContent).not.toContain('Mit Quiz');
    expect(fixture.nativeElement.textContent).not.toContain('Mit Q&A');
    expect(fixture.nativeElement.textContent).toContain('Startet mit „Deep Learning Quiz“.');
  });

  it('setzt Q&A als Start, wenn Quiz deaktiviert ist', () => {
    TestBed.configureTestingModule({
      imports: [LiveSessionDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            quizName: 'Deep Learning Quiz',
            quizCanStart: true,
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(LiveSessionDialogComponent);
    const component = fixture.componentInstance;

    component.toggleQuiz(false);

    expect(component.startChannel()).toBe('qa');
    expect(component.channelStateLabel('qa')).toBe('Start');
  });

  it('kann Blitzlicht als Start setzen, wenn Quiz deaktiviert ist', () => {
    TestBed.configureTestingModule({
      imports: [LiveSessionDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            quizName: 'Deep Learning Quiz',
            quizCanStart: true,
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(LiveSessionDialogComponent);
    const component = fixture.componentInstance;

    component.toggleQuiz(false);
    component.handleChannelCardClick('quickFeedback');

    expect(component.enableQuickFeedback()).toBe(true);
    expect(component.startChannel()).toBe('quickFeedback');
    expect(component.channelStateLabel('quickFeedback')).toBe('Start');
    expect(component.channelStateLabel('qa')).toBe('An');
  });
});
