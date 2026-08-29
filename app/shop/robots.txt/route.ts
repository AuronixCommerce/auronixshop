import { SHOP_SITE_URL } from '@/lib/shop';

export const dynamic = 'force-static';

export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${SHOP_SITE_URL}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400' } });
}
