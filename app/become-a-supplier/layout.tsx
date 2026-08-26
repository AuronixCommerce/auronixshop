import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Become a Supplier | Supplier Partnerships | Auronix Commerce',
  description:
    'Submit your company and product information to explore a supplier partnership with Auronix Commerce LLC.',
  path:
    '/become-a-supplier',
  keywords: [
    'become a supplier',
    'supplier application',
    'wholesale supplier',
    'product supplier',
    'supplier partnership',
    'sell products to Auronix',
  ],
});

export default function BecomeASupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}