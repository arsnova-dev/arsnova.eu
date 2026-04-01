#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const browserRoot = path.join(frontendRoot, 'dist', 'browser');
const ngswCli = path.resolve(frontendRoot, '../../node_modules/@angular/service-worker/ngsw-config.js');
const locales = ['de', 'en', 'fr', 'it', 'es'];

if (!fs.existsSync(browserRoot)) {
  console.warn('regenerate-ngsw-localized: dist/browser fehlt, ueberspringe.');
  process.exit(0);
}

if (!fs.existsSync(ngswCli)) {
  console.error(`regenerate-ngsw-localized: ngsw-config CLI nicht gefunden: ${ngswCli}`);
  process.exit(1);
}

for (const locale of locales) {
  const localeDir = path.join(browserRoot, locale);
  if (!fs.existsSync(localeDir)) {
    console.warn(`regenerate-ngsw-localized: ${localeDir} fehlt, ueberspringe ${locale}.`);
    continue;
  }

  execFileSync(
    process.execPath,
    [ngswCli, `dist/browser/${locale}`, 'ngsw-config.json', `/${locale}/`],
    {
      cwd: frontendRoot,
      stdio: 'inherit',
    },
  );
}
