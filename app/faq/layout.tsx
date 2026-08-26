import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Auronix Commerce FAQ | Frequently Asked Questions',
  description:
    'Find answers about Auronix Commerce LLC, supplier partnerships, seller applications, marketplace operations, procurement, distribution, and support.',
  path:
    '/faq',
  keywords: [
    'Auronix FAQ',
    'Auronix Commerce questions',
    'seller FAQ',
    'supplier FAQ',
    'marketplace operations FAQ',
  ],
});

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}