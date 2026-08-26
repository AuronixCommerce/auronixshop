import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Marketplace Expertise | eCommerce Marketplace Operations | Auronix',
  description:
    'Auronix Commerce provides structured marketplace expertise across product selection, catalog operations, listing quality, pricing, inventory coordination, and optimization.',
  path:
    '/marketplace-expertise',
  keywords: [
    'marketplace expertise',
    'eCommerce marketplace management',
    'catalog optimization',
    'product listing optimization',
    'marketplace strategy',
  ],
});

export default function MarketplaceExpertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}