import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Service für den Sprachwechsel: Quiz Edit/New melden ungespeicherte Änderungen.
 * Die Toolbar fragt vor dem Wechsel der Locale-URL ab und zeigt ggf. einen Hinweis-Dialog.
 */
@Injectable({ providedIn: 'root' })
export class LocaleSwitchGuardService {
  private readonly router = inject(Router);
  private getDirty: (() => boolean) | null = null;

  register(getDirty: () => boolean): void {
    this.getDirty = getDirty;
  }

  unregister(): void {
    this.getDirty = null;
  }

  /**
   * true, wenn die aktuelle Route Quiz-Edit oder Quiz-New ist und es ungespeicherte Änderungen gibt.
   */
  hasUnsavedChanges(): boolean {
    const url = this.router.url;
    const onNew = url.includes('quiz/new');
    const onEdit = /\/quiz\/[^/]+/.test(url) && !url.includes('preview');
    if (!onNew && !onEdit) return false;
    return this.getDirty?.() ?? false;
  }
}
