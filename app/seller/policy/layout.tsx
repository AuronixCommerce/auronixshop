import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Seller Policy | Auronix Commerce LLC',
  description:
    'Review Auronix Commerce LLC seller eligibility, application requirements, business information standards, verification procedures, and seller responsibilities.',
  path:
    '/seller/policy',
  keywords: [
    'Auronix seller policy',
    'seller requirements',
    'seller eligibility',
    'seller application policy',
    'seller verification',
    'marketplace seller rules',
  ],
});

export default function SellerPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}