import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata =
  buildNoIndexSeo(
    'Partner Portal | Auronix Commerce LLC',
    'Secure partner resources and information for Auronix Commerce LLC partners.',
    '/partner-portal'
  );

export default function PartnerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}