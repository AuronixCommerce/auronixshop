import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Seller Application | Auronix Commerce LLC',
    'Submit your business information to apply for a seller partnership with Auronix Commerce LLC.',
    '/seller/apply'
  );

export default function SellerApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}