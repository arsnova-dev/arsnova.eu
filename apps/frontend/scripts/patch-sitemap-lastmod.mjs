/**
 * Setzt <lastmod> (UTC-Datum YYYY-MM-DD) in allen Sitemap-Kopien unter dist/browser/<locale>/sitemap.xml.
 * Aufruf nach ng build --localize (siehe package.json build:localize).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browserDir = path.join(__dirname, '../dist/browser');
const lastmod = new Date().toISOString().slice(0, 10);

function patchFile(filePath) {
  let s = fs.readFileSync(filePath, 'utf8');
  if (s.includes('<lastmod>')) {
    s = s.replace(/<lastmod>[^<]*<\/lastmod>\s*/g, '');
  }
  const needle = '</loc>\n    <changefreq>';
  if (!s.includes(needle)) {
    console.warn(`patch-sitemap-lastmod: unerwartetes Format, überspringe ${filePath}`);
    return;
  }
  s = s.replaceAll(needle, `</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>`);
  fs.writeFileSync(filePath, s);
  console.log(`patch-sitemap-lastmod: ${path.relative(browserDir, filePath)} → <lastmod>${lastmod}</lastmod>`);
}

if (!fs.existsSync(browserDir)) {
  console.warn('patch-sitemap-lastmod: dist/browser fehlt (Build ausgeführt?).');
  process.exit(0);
}

const locales = ['de', 'en', 'fr', 'it', 'es'];
let n = 0;
for (const loc of locales) {
  const p = path.join(browserDir, loc, 'sitemap.xml');
  if (fs.existsSync(p)) {
    patchFile(p);
    n++;
  }
}
const rootSitemap = path.join(browserDir, 'sitemap.xml');
if (fs.existsSync(rootSitemap)) {
  patchFile(rootSitemap);
  n++;
}
if (n === 0) {
  console.warn('patch-sitemap-lastmod: keine sitemap.xml unter dist/browser gefunden.');
}
