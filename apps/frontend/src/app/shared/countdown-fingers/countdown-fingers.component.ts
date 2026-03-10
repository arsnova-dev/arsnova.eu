import { Component, computed, input } from '@angular/core';

const FINGER_IMAGES: Record<number, string> = {
  5: 'assets/countdown-fingers/countdown_poster_clean_5.png',
  4: 'assets/countdown-fingers/countdown_poster_clean_4.png',
  3: 'assets/countdown-fingers/countdown_poster_clean_3.png',
  2: 'assets/countdown-fingers/countdown_poster_clean_2.png',
  1: 'assets/countdown-fingers/countdown_poster_clean_1.png',
  0: 'assets/countdown-fingers/countdown_poster_clean_0.png',
};

@Component({
  selector: 'app-countdown-fingers',
  standalone: true,
  template: `
    @if (imageSrc()) {
      <div
        class="countdown-fingers"
        [class.countdown-fingers--large]="size() === 'large'"
        [class.countdown-fingers--small]="size() === 'small'"
        role="img"
        [attr.aria-label]="seconds() + ' Sekunden'"
      >
        <img [src]="imageSrc()" [alt]="seconds() + ' Finger'" class="countdown-fingers__img" />
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .countdown-fingers {
      pointer-events: none;
      user-select: none;
    }

    .countdown-fingers__img {
      display: block;
      object-fit: contain;
    }

    .countdown-fingers--large {
      .countdown-fingers__img {
        width: 120px;
        height: auto;
        image-rendering: auto;
      }
    }

    .countdown-fingers--small {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      z-index: 100;

      .countdown-fingers__img {
        width: 56px;
        height: auto;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .countdown-fingers {
        .countdown-fingers__img {
          animation: none !important;
        }
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .countdown-fingers__img {
        animation: finger-pop 300ms ease-out;
      }
    }

    @keyframes finger-pop {
      0% { opacity: 0; transform: scale(0.7); }
      60% { transform: scale(1.08); }
      100% { opacity: 1; transform: scale(1); }
    }
  `],
})
export class CountdownFingersComponent {
  readonly seconds = input.required<number>();
  readonly size = input<'small' | 'large'>('small');

  readonly imageSrc = computed(() => {
    const s = this.seconds();
    return s >= 0 && s <= 5 ? FINGER_IMAGES[s] ?? null : null;
  });
}
