import type { APIRoute } from 'astro';

import { toAbsoluteUrl } from '@/config/site';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${toAbsoluteUrl('sitemap.xml')}`].join(
    '\n',
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
