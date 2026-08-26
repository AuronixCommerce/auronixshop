import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Our Process | Product Sourcing to Marketplace Growth | Auronix',
  description:
    'Discover how Auronix Commerce evaluates opportunities, sources products, manages procurement, prepares listings, and supports marketplace growth.',
  path:
    '/our-process',
  keywords: [
    'eCommerce process',
    'supplier sourcing process',
    'product launch process',
    'procurement workflow',
    'marketplace growth',
  ],
});

export default function OurProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}