import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Activate Seller Account | Auronix Commerce',
    'Activate your Auronix Commerce seller account.',
    '/seller/activate'
  );

export default function SellerActivateSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
