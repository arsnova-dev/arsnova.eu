import { inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { ResolveFn } from '@angular/router';
import type { AppLocale } from '@arsnova/shared-types';
import { loadNewsArchivePageModel, type NewsArchiveInitialModel } from './news-archive-initial';

function appLocaleFromInjectedId(localeId: string): AppLocale {
  if (
    localeId === 'de' ||
    localeId === 'en' ||
    localeId === 'fr' ||
    localeId === 'it' ||
    localeId === 'es'
  ) {
    return localeId;
  }
  return 'de';
}

export const newsArchivePageResolver: ResolveFn<NewsArchiveInitialModel> = async () => {
  const locale = appLocaleFromInjectedId(inject(LOCALE_ID));
  const sanitizer = inject(DomSanitizer);
  const fallbackTitle = $localize`:@@motd.archiveItemFallbackTitle:Archiv-Meldung`;
  const loadError = $localize`:@@motd.archiveLoadError:Archiv konnte nicht geladen werden.`;
  return loadNewsArchivePageModel(locale, sanitizer, fallbackTitle, loadError);
};
