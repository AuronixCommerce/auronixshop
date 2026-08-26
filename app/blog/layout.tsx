import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Auronix Commerce Insights | eCommerce, Procurement & Marketplace',
  description:
    'Read Auronix Commerce insights on procurement, supplier partnerships, product sourcing, eCommerce, marketplace operations, and distribution.',
  path:
    '/blog',
  keywords: [
    'eCommerce insights',
    'procurement insights',
    'marketplace operations blog',
    'supplier partnership insights',
    'Auronix blog',
  ],
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}