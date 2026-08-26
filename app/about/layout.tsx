import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'About Auronix Commerce LLC | Modern Commerce Operations',
  description:
    'Learn about Auronix Commerce LLC, our procurement approach, supplier relationships, product distribution, and marketplace operations.',
  path:
    '/about',
  keywords: [
    'about Auronix Commerce',
    'commerce company',
    'procurement company',
    'supplier relationship management',
    'marketplace operations',
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}