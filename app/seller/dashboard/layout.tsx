import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Seller Dashboard | Auronix Commerce',
    'Private seller dashboard.',
    '/seller/dashboard'
  );

export default function SellerDashboardSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
