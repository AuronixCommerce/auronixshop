import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Partners | Supplier & Brand Partnerships | Auronix Commerce',
  description:
    'Auronix Commerce works with manufacturers, distributors, wholesalers, suppliers, and quality brands to build long-term commerce partnerships.',
  path:
    '/partners',
  keywords: [
    'Auronix partners',
    'supplier partnerships',
    'brand partnerships',
    'wholesale partnerships',
    'manufacturer partnerships',
    'distribution partnership',
  ],
});

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}