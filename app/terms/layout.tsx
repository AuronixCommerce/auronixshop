import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Terms of Service | Auronix Commerce LLC',
  description:
    'Review the Terms of Service governing use of the Auronix Commerce LLC website and services.',
  path:
    '/terms',
  keywords: [
    'Auronix terms of service',
    'website terms',
    'service terms',
  ],
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}