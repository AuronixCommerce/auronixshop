import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Seller Settings | Auronix Commerce',
    'Private seller account settings.',
    '/seller/settings'
  );

export default function SellerSettingsSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
