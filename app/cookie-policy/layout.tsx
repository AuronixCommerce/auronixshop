import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Cookie Policy | Auronix Commerce LLC',
  description:
    'Learn how Auronix Commerce LLC uses cookies and similar technologies on its website.',
  path:
    '/cookie-policy',
  keywords: [
    'Auronix cookie policy',
    'website cookies',
    'cookie policy',
  ],
});

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}