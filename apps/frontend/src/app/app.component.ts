import { Component, HostListener, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SwUpdate } from '@angular/service-worker';
import { ThemePresetService } from './core/theme-preset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatButton, MatIcon],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly year = new Date().getFullYear();
  isOnline = signal(true);
  updateAvailable = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate, { optional: true });
  private readonly themePreset = inject(ThemePresetService);
  private versionSub: Subscription | null = null;

  ngOnInit(): void {
    void this.themePreset; // Nur injizieren, damit Theme/Preset beim App-Start aus localStorage angewendet werden
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);
      this.checkForUpdates();
    }
  }

  ngOnDestroy(): void {
    this.versionSub?.unsubscribe();
  }

  private checkForUpdates(): void {
    if (!this.swUpdate?.isEnabled) return;
    this.versionSub = this.swUpdate.versionUpdates.subscribe((evt) => {
      if (evt.type === 'VERSION_READY') this.updateAvailable.set(true);
    });
  }

  async reloadWithUpdate(): Promise<void> {
    if (!this.swUpdate?.isEnabled) {
      window.location.reload();
      return;
    }
    try {
      await this.swUpdate.activateUpdate();
      // Kurz warten, damit der neue Service Worker die Kontrolle übernimmt.
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    } catch {
      // Bei Fehler trotzdem neu laden (z. B. kein Update mehr pending).
    }
    window.location.reload();
  }

  @HostListener('window:online')
  onOnline(): void {
    this.isOnline.set(true);
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.isOnline.set(false);
  }

  retryOnline(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (navigator.onLine) {
      this.isOnline.set(true);
    } else {
      window.location.reload();
    }
  }
}
