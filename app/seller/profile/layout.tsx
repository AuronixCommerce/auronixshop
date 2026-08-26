import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Seller Profile | Auronix Commerce',
    'Private seller profile area.',
    '/seller/profile'
  );

export default function SellerProfileSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
