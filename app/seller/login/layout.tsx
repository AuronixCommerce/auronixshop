import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Seller Login | Auronix Commerce',
    'Secure seller account sign in.',
    '/seller/login'
  );

export default function SellerLoginSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
