import { SHOP_PRODUCTS, SHOP_SITE_URL } from '@/lib/shop';

export const dynamic = 'force-static';

export function GET() {
  const urls = [
    { path: '', priority: '1.0', frequency: 'weekly' },
    { path: '/about', priority: '0.6', frequency: 'monthly' },
    ...SHOP_PRODUCTS.map((product) => ({ path: `/products/${product.slug}`, priority: '0.8', frequency: 'monthly' })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(({ path, priority, frequency }) => `\n  <url><loc>${SHOP_SITE_URL}${path}</loc><changefreq>${frequency}</changefreq><priority>${priority}</priority></url>`).join('')}\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400' } });
}
