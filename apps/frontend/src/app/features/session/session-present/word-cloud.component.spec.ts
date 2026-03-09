import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { WordCloudComponent } from './word-cloud.component';

describe('WordCloudComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WordCloudComponent],
    });
  });

  it('zeigt aggregierte Wörter und filtert Antworten per Klick', () => {
    const fixture = TestBed.createComponent(WordCloudComponent);
    fixture.componentRef.setInput('responses', [
      'Motivation durch Teamarbeit',
      'Teamarbeit macht Spaß',
      'Motivation hilft beim Lernen',
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text.toLowerCase()).toContain('motivation');
    expect(text.toLowerCase()).toContain('teamarbeit');

    const component = fixture.componentInstance;
    component.toggleWord('motivation');
    fixture.detectChanges();

    expect(component.filteredResponses().length).toBe(2);
  });

  it('kann Stopwörter optional einblenden', () => {
    const fixture = TestBed.createComponent(WordCloudComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('responses', [
      'Motivation und Teamarbeit',
      'Teamarbeit und Fokus',
    ]);
    fixture.detectChanges();

    expect(component.words().some((entry) => entry.word === 'und')).toBe(false);
    component.toggleStopwords();
    fixture.detectChanges();
    expect(component.words().some((entry) => entry.word === 'und')).toBe(true);
  });
});
