import {
  AfterViewInit,
  Component,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { trpc } from '../../core/trpc.client';
import { ServerStatusWidgetComponent } from '../../shared/server-status-widget/server-status-widget.component';
import { ThemePresetService } from '../../core/theme-preset.service';

/** Host-Anchor für dynamisch geladenes PresetToast (eigener Chunk, bessere Mobile-Performance). */
@Directive({ selector: '[presetToastHost]', standalone: true })
class PresetToastHostDirective {
  readonly vcRef = inject(ViewContainerRef);
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatButton,
    MatIconButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    ServerStatusWidgetComponent,
    PresetToastHostDirective,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  @ViewChild('homeHeader') private readonly homeHeader?: ElementRef<HTMLElement>;
  @ViewChild('controlsToggleBtn') private readonly controlsToggleBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('sessionCodeInput') private readonly sessionCodeInput?: ElementRef<HTMLInputElement>;
  @ViewChild(PresetToastHostDirective) private presetToastHost?: PresetToastHostDirective;

  private presetToastRef: ComponentRef<unknown> | null = null;

  apiStatus = signal<string | null>(null);
  apiRetrying = signal(false);
  redisStatus = signal<string | null>(null);
  sessionCode = signal('');
  codeInputFocused = signal(false);
  codeShaking = signal(false);
  ctaReady = signal(false);
  recentSessionCodes = signal<string[]>([]);
  joinError = signal<string | null>(null);
  isJoining = signal(false);

  readonly themePreset = inject(ThemePresetService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly supportedLanguages = [
    { code: 'de' as const, label: 'Deutsch' },
    { code: 'en' as const, label: 'English' },
    { code: 'fr' as const, label: 'Français' },
    { code: 'it' as const, label: 'Italiano' },
    { code: 'es' as const, label: 'Español' },
  ];
  language = signal<'de' | 'en' | 'fr' | 'it' | 'es'>('de');
  controlsMenuOpen = signal(false);
  presetToastVisible = signal(false);
  presetSnackbarVisible = signal(false);
  /** Einmalig beim ersten Wechsel auf Spielerisch: Snackbar-Text „Jetzt mit mehr Schwung!“ */
  firstTimePlayfulMessage = signal(false);

  presetSnackbarIcon = computed(() => this.themePreset.preset() === 'serious' ? 'school' : 'celebration');
  presetSnackbarLabel = computed(() => {
    if (this.firstTimePlayfulMessage() && this.themePreset.preset() === 'spielerisch') {
      return 'Jetzt mit mehr Schwung!';
    }
    return this.themePreset.preset() === 'serious' ? 'Preset: Seriös' : 'Preset: Spielerisch';
  });
  isValidSessionCode = computed(() => /^[A-Z0-9]{6}$/.test(this.sessionCode()));
  readonly demoSessionCode = 'DEMO01';
  readonly codeSlots = [0, 1, 2, 3, 4, 5];

  private snackbarTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.sessionCodeInput?.nativeElement.focus(), 100);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedLang = localStorage.getItem('home-language');
      if (storedLang && ['de', 'en', 'fr', 'it', 'es'].includes(storedLang)) {
        this.language.set(storedLang as 'de' | 'en' | 'fr' | 'it' | 'es');
      }
      this.loadRecentSessionCodes();
    }
    // Health-Check nach First Paint, damit API-Anfrage den kritischen Lade-Pfad nicht blockiert
    if (isPlatformBrowser(this.platformId)) {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => this.checkApiConnection(), { timeout: 2000 });
      } else {
        setTimeout(() => this.checkApiConnection(), 0);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.snackbarTimer) clearTimeout(this.snackbarTimer);
    if (this.presetToastRef) {
      this.presetToastRef.destroy();
      this.presetToastRef = null;
    }
  }

  async checkApiConnection(): Promise<void> {
    try {
      const health = await trpc.health.check.query();
      this.apiStatus.set(health.status);
      this.redisStatus.set(health.redis ?? null);
    } catch {
      this.apiStatus.set(null);
    }
  }

  async retryConnection(): Promise<void> {
    this.apiRetrying.set(true);
    await this.checkApiConnection();
    this.apiRetrying.set(false);
  }

  private loadRecentSessionCodes(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem('home-recent-sessions');
      const codes = raw ? (JSON.parse(raw) as string[]) : [];
      const valid = Array.isArray(codes)
        ? codes.filter((c) => typeof c === 'string' && /^[A-Z0-9]{6}$/.test(c.trim().toUpperCase())).slice(0, 3)
        : [];
      this.recentSessionCodes.set(valid);
    } catch {
      this.recentSessionCodes.set([]);
    }
  }

  private addToRecentSessionCodes(code: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) return;
    const current = this.recentSessionCodes();
    const filtered = current.filter((c) => c !== normalized);
    const updated = [normalized, ...filtered].slice(0, 3);
    this.recentSessionCodes.set(updated);
    localStorage.setItem('home-recent-sessions', JSON.stringify(updated));
  }

  async joinSessionByCode(code: string): Promise<void> {
    this.sessionCode.set(code);
    await this.joinSession();
  }

  setLanguage(code: 'de' | 'en' | 'fr' | 'it' | 'es'): void {
    this.language.set(code);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('home-language', code);
    }
    setTimeout(() => this.sessionCodeInput?.nativeElement.focus(), 0);
  }

  onThemeChange(value: 'system' | 'dark' | 'light'): void {
    this.themePreset.setTheme(value);
    this.closeControlsMenu();
    setTimeout(() => this.sessionCodeInput?.nativeElement.focus(), 0);
  }

  setPreset(value: string | null, closeMenu = false): void {
    const nextPreset = value === 'serious' || value === 'spielerisch' ? value : null;
    if (nextPreset) {
      if (this.themePreset.preset() !== nextPreset) {
        this.themePreset.setPreset(nextPreset);
      }
      this.showPresetSnackbar();
      // Fokus zurück auf die Mitmach-Karte (Code-Eingabe), damit der Fokus nach Umschaltung nicht verloren geht
      setTimeout(() => this.sessionCodeInput?.nativeElement.focus(), 0);
    }
    if (closeMenu) this.closeControlsMenu();
  }

  private static readonly STORAGE_PLAYFUL_WELCOMED = 'home-playful-welcomed';

  private showPresetSnackbar(): void {
    const isPlayful = this.themePreset.preset() === 'spielerisch';
    const firstTime = isPlatformBrowser(this.platformId) && isPlayful && !localStorage.getItem(HomeComponent.STORAGE_PLAYFUL_WELCOMED);
    this.firstTimePlayfulMessage.set(firstTime);
    if (firstTime && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(HomeComponent.STORAGE_PLAYFUL_WELCOMED, '1');
    }
    this.presetSnackbarVisible.set(true);
    if (this.snackbarTimer) clearTimeout(this.snackbarTimer);
    const duration = firstTime ? 6000 : 5000;
    this.snackbarTimer = setTimeout(() => {
      this.presetSnackbarVisible.set(false);
      this.firstTimePlayfulMessage.set(false);
    }, duration);
  }

  dismissSnackbar(): void {
    this.presetSnackbarVisible.set(false);
    this.firstTimePlayfulMessage.set(false);
    if (this.snackbarTimer) { clearTimeout(this.snackbarTimer); this.snackbarTimer = null; }
  }

  openPresetCustomize(): void {
    this.dismissSnackbar();
    this.presetToastVisible.set(true);
    setTimeout(() => this.loadPresetToast(), 0);
  }

  closePresetToast(): void {
    if (this.presetToastRef) {
      this.presetToastRef.destroy();
      this.presetToastRef = null;
    }
    this.presetToastVisible.set(false);
    setTimeout(() => this.sessionCodeInput?.nativeElement.focus(), 0);
  }

  private loadPresetToast(): void {
    if (this.presetToastRef || !this.presetToastHost) return;
    import('../../shared/preset-toast/preset-toast.component').then((m) => {
      if (!this.presetToastHost || this.presetToastRef) return;
      const ref = this.presetToastHost.vcRef.createComponent(m.PresetToastComponent);
      (ref.instance as { closed: { subscribe: (fn: () => void) => void } }).closed.subscribe(() =>
        this.closePresetToast(),
      );
      this.presetToastRef = ref;
    });
  }

  focusCodeInput(): void {
    this.sessionCodeInput?.nativeElement.focus();
  }

  private triggerShake(): void {
    this.codeShaking.set(true);
    setTimeout(() => this.codeShaking.set(false), 400);
  }

  private triggerCtaPulse(): void {
    this.ctaReady.set(false);
    requestAnimationFrame(() => this.ctaReady.set(true));
    setTimeout(() => this.ctaReady.set(false), 350);
  }

  toggleControlsMenu(): void {
    this.controlsMenuOpen.set(!this.controlsMenuOpen());
  }

  preloadQuiz(): void {
    import('../quiz/quiz.component').then(() => {});
  }

  closeControlsMenu(restoreFocus = false): void {
    this.controlsMenuOpen.set(false);
    if (restoreFocus) {
      setTimeout(() => this.controlsToggleBtn?.nativeElement.focus(), 0);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.presetToastVisible()) {
      this.closePresetToast();
      return;
    }
    if (this.controlsMenuOpen()) {
      this.closeControlsMenu(true);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.isValidSessionCode()) this.joinSession();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.controlsMenuOpen()) return;
    const target = event.target as Node | null;
    if (!target) return;
    const insideHeader = this.homeHeader?.nativeElement.contains(target) ?? false;
    if (!insideHeader) {
      this.closeControlsMenu();
    }
  }

  onSessionCodeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const prev = this.sessionCode();
    const normalized = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    this.sessionCode.set(normalized);
    this.joinError.set(null);
    if (normalized.length === 6 && prev.length < 6) {
      this.triggerCtaPulse();
    }
  }

  async joinSession(): Promise<void> {
    if (this.isJoining()) return;
    const code = this.sessionCode().trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      this.joinError.set('Bitte den 6-stelligen Code eingeben.');
      this.triggerShake();
      this.sessionCodeInput?.nativeElement.focus();
      return;
    }
    this.joinError.set(null);
    this.isJoining.set(true);
    this.addToRecentSessionCodes(code);
    try {
      await this.router.navigate(['/session', code]);
    } finally {
      this.isJoining.set(false);
    }
  }
}
