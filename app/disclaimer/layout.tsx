import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Disclaimer | Auronix Commerce LLC',
  description:
    'Read important disclaimers regarding information, partnerships, marketplace operations, and services provided by Auronix Commerce LLC.',
  path:
    '/disclaimer',
  keywords: [
    'Auronix disclaimer',
    'commerce disclaimer',
    'marketplace disclaimer',
  ],
});

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}