import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Auronix Support | Help, FAQs & Customer Support',
  description:
    'Get help from Auronix Commerce through support resources, FAQs, contact options, and support channels.',
  path:
    '/support',
  keywords: [
    'Auronix support',
    'eCommerce support',
    'seller support',
    'supplier support',
    'Auronix help',
  ],
});

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}