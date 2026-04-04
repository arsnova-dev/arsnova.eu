import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// base: bei GitHub Pages = /<repo-name>/ (Projekt-Site), sonst / (eigene Domain)
const base = process.env.BASE_PATH || '/';
const site = process.env.PUBLIC_SITE_URL || 'https://arsnova.eu/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [tailwind()],
  output: 'static',
});
