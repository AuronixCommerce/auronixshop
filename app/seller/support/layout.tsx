import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Seller Support | Auronix Commerce',
    'Private seller support area.',
    '/seller/support'
  );

export default function SellerSupportSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
