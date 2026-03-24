// Nach `ng build --localize`: pro Locale start_url, lang, name, description, Screenshot-Labels.
// name/description = gleiche Bedeutung wie seo.titleHome / seo.descHome (XLF).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browserDir = path.resolve(__dirname, '../dist/browser');
const LOCALES = ['de', 'en', 'fr', 'it', 'es'];

const MANIFEST_I18N = {
  de: {
    name: 'arsnova.eu – Live-Quiz & Abstimmung',
    description:
      'Kostenlose, DSGVO-konforme Live-Quiz- und Abstimmungsplattform für Hochschulen, Schulen, Events und Business.',
    screenshotWide: 'arsnova.eu – Desktop Ansicht',
    screenshotNarrow: 'arsnova.eu – Mobile Ansicht',
  },
  en: {
    name: 'arsnova.eu – Live quiz & voting',
    description:
      'Free, GDPR-compliant live quiz and voting platform for universities, schools, events, and business.',
    screenshotWide: 'arsnova.eu – Desktop view',
    screenshotNarrow: 'arsnova.eu – Mobile view',
  },
  fr: {
    name: 'arsnova.eu – Quiz en direct et vote',
    description:
      'Quiz en direct et plateforme de vote gratuits et conformes au RGPD pour les universités, les écoles, les événements et les entreprises.',
    screenshotWide: 'arsnova.eu – Vue bureau',
    screenshotNarrow: 'arsnova.eu – Vue mobile',
  },
  es: {
    name: 'arsnova.eu – Prueba en vivo y votación',
    description:
      'Plataforma gratuita de votación y cuestionarios en vivo que cumple con el RGPD para universidades, escuelas, eventos y empresas.',
    screenshotWide: 'arsnova.eu – Vista de escritorio',
    screenshotNarrow: 'arsnova.eu – Vista móvil',
  },
  it: {
    name: 'arsnova.eu – Quiz e votazioni dal vivo',
    description:
      'Piattaforma di votazione e quiz live gratuita e conforme al GDPR per università, scuole, eventi e aziende.',
    screenshotWide: 'arsnova.eu – Vista desktop',
    screenshotNarrow: 'arsnova.eu – Vista mobile',
  },
};

function main() {
  if (!fs.existsSync(browserDir)) {
    console.warn('patch-pwa-manifest-per-locale: dist/browser fehlt, überspringe.');
    process.exit(0);
  }

  for (const locale of LOCALES) {
    const file = path.join(browserDir, locale, 'manifest.webmanifest');
    if (!fs.existsSync(file)) {
      console.warn(`patch-pwa-manifest-per-locale: ${file} fehlt, überspringe ${locale}.`);
      continue;
    }
    let raw;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch (e) {
      console.warn(`patch-pwa-manifest-per-locale: Lesen fehlgeschlagen (${locale}):`, e);
      continue;
    }
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.warn(`patch-pwa-manifest-per-locale: JSON ungültig (${locale}):`, e);
      continue;
    }
    json.start_url = `/${locale}/?homescreen=1`;
    json.lang = locale;

    const copy = MANIFEST_I18N[locale];
    if (copy) {
      json.name = copy.name;
      json.description = copy.description;
      if (Array.isArray(json.screenshots)) {
        for (const shot of json.screenshots) {
          if (shot.form_factor === 'wide') shot.label = copy.screenshotWide;
          if (shot.form_factor === 'narrow') shot.label = copy.screenshotNarrow;
        }
      }
    }

    fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  }
}

main();
