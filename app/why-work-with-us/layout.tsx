import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Why Work With Auronix Commerce LLC | Commerce Partnerships',
  description:
    'Discover why suppliers, brands, and commerce partners choose Auronix for procurement, marketplace operations, sourcing, and structured partnerships.',
  path:
    '/why-work-with-us',
  keywords: [
    'why work with Auronix',
    'eCommerce partnership',
    'supplier partnership',
    'brand partnership',
    'marketplace partner',
  ],
});

export default function WhyWorkWithUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}