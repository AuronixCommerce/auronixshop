import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Contact Auronix Commerce LLC | Business & Partnership Inquiries',
  description:
    'Contact Auronix Commerce LLC for supplier partnerships, brand opportunities, procurement, marketplace operations, distribution, and general business inquiries.',
  path:
    '/contact',
  keywords: [
    'contact Auronix Commerce',
    'Auronix contact',
    'supplier inquiry',
    'business partnership inquiry',
    'eCommerce business contact',
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}