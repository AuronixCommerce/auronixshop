import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Become a Seller | Auronix Commerce LLC Seller Partnerships',
  description:
    'Learn how businesses can apply to work with Auronix Commerce LLC as marketplace sellers and explore our seller partnership process.',
  path:
    '/seller',
  keywords: [
    'Auronix seller',
    'become a seller',
    'seller partnership',
    'marketplace seller',
    'eCommerce seller application',
  ],
});

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}