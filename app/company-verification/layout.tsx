import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({
  title:
    'Company Verification | Auronix Commerce LLC',
  description:
    'View company information and business details for Auronix Commerce LLC through the company verification page.',
  path:
    '/company-verification',
  keywords: [
    'Auronix company verification',
    'Auronix Commerce LLC verification',
    'company information',
    'business verification',
  ],
});

export default function CompanyVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}