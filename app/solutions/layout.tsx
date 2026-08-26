import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'eCommerce Solutions | Procurement, Sourcing & Distribution | Auronix',
  description:
    'Explore Auronix Commerce solutions for supplier partnerships, procurement, product sourcing, marketplace operations, and distribution.',
  path:
    '/solutions',
  keywords: [
    'eCommerce solutions',
    'procurement services',
    'product sourcing',
    'supplier partnerships',
    'marketplace management',
    'distribution services',
  ],
});

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}