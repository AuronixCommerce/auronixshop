import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Careers at Auronix Commerce LLC | Opportunities',
  description:
    'Explore career opportunities at Auronix Commerce LLC across eCommerce, marketplace operations, procurement, and business operations.',
  path:
    '/careers',
  keywords: [
    'Auronix careers',
    'Auronix jobs',
    'eCommerce careers',
    'marketplace operations jobs',
    'commerce jobs',
  ],
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}