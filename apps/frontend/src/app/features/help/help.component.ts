import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

/**
 * Hilfe-Seite: Nutzerorientierte Anleitung, inhaltlich am Backlog ausgerichtet.
 */
@Component({
  selector: 'app-help',
  imports: [RouterLink, MatButton, MatIcon],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent {}
