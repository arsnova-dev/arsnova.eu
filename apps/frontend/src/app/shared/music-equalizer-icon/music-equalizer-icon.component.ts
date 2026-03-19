import { Component, input } from '@angular/core';

/**
 * Animiertes Equalizer-Icon (5 Balken) für „Musik läuft“.
 * Ersetzt mat-icon graphic_eq mit dezenter Balken-Animation.
 */
@Component({
  selector: 'app-music-equalizer-icon',
  standalone: true,
  template: `
    <svg
      class="music-equalizer-icon"
      [class.music-equalizer-icon--small]="size() === 'small'"
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-hidden="true"
    >
      <rect
        class="music-equalizer-icon__bar music-equalizer-icon__bar--1"
        x="3"
        y="6"
        width="2.5"
        height="12"
        rx="0.5"
      />
      <rect
        class="music-equalizer-icon__bar music-equalizer-icon__bar--2"
        x="8"
        y="6"
        width="2.5"
        height="12"
        rx="0.5"
      />
      <rect
        class="music-equalizer-icon__bar music-equalizer-icon__bar--3"
        x="13"
        y="6"
        width="2.5"
        height="12"
        rx="0.5"
      />
      <rect
        class="music-equalizer-icon__bar music-equalizer-icon__bar--4"
        x="18"
        y="6"
        width="2.5"
        height="12"
        rx="0.5"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        vertical-align: middle;
      }

      .music-equalizer-icon {
        display: block;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .music-equalizer-icon--small {
        width: 1rem;
        height: 1rem;
      }

      .music-equalizer-icon__bar {
        transform-origin: 50% 100%;
      }

      @media (prefers-reduced-motion: no-preference) {
        .music-equalizer-icon__bar {
          animation: music-equalizer-bar 1.2s ease-in-out infinite;
        }

        .music-equalizer-icon__bar--1 {
          animation-delay: 0ms;
        }
        .music-equalizer-icon__bar--2 {
          animation-delay: 150ms;
        }
        .music-equalizer-icon__bar--3 {
          animation-delay: 300ms;
        }
        .music-equalizer-icon__bar--4 {
          animation-delay: 450ms;
        }
      }

      @keyframes music-equalizer-bar {
        0%,
        100% {
          transform: scaleY(0.4);
        }
        50% {
          transform: scaleY(1);
        }
      }
    `,
  ],
})
export class MusicEqualizerIconComponent {
  readonly size = input<'small' | 'default'>('default');
}
