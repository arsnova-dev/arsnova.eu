/// <reference types="@angular/localize" />

import { registerLocaleData } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

function normalizeLocale(value: string | undefined): 'de' | 'en' | 'fr' | 'es' | 'it' {
  const lang = (value ?? 'de').toLowerCase();
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('fr')) return 'fr';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('it')) return 'it';
  return 'de';
}

async function registerActiveLocaleData(): Promise<void> {
  const i18nGlobal = globalThis as typeof globalThis & { $localize?: { locale?: string } };
  const activeLocale = normalizeLocale(i18nGlobal.$localize?.locale);
  switch (activeLocale) {
    case 'en': {
      const localeEn = (await import('@angular/common/locales/en')).default;
      registerLocaleData(localeEn);
      break;
    }
    case 'fr': {
      const localeFr = (await import('@angular/common/locales/fr')).default;
      registerLocaleData(localeFr);
      break;
    }
    case 'es': {
      const localeEs = (await import('@angular/common/locales/es')).default;
      registerLocaleData(localeEs);
      break;
    }
    case 'it': {
      const localeIt = (await import('@angular/common/locales/it')).default;
      registerLocaleData(localeIt);
      break;
    }
    case 'de':
    default: {
      const localeDe = (await import('@angular/common/locales/de')).default;
      registerLocaleData(localeDe);
      break;
    }
  }
}

void registerActiveLocaleData()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
