import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Privacy Policy | Auronix Commerce LLC',
  description:
    'Read the Auronix Commerce LLC Privacy Policy covering information collection, use, communications, and website privacy practices.',
  path:
    '/privacy',
  keywords: [
    'Auronix privacy policy',
    'website privacy',
    'data privacy',
    'information privacy',
  ],
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}