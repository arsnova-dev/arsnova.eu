import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

/**
 * Quiz-Verwaltungsseite (Epic 1).
 * Platzhalter – wird mit Story 1.1 (Quiz erstellen) implementiert.
 */
@Component({
  selector: 'app-quiz',
  imports: [RouterLink, MatButton, MatCard, MatCardContent, MatIcon],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent {}
