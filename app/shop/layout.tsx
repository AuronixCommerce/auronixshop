import type { Metadata } from 'next';
import { SHOP_SITE_URL } from '@/lib/shop';

export const metadata: Metadata = {
  metadataBase: new URL(SHOP_SITE_URL),
  title: { default: 'Auronix Commerce Shop | Curated Amazon Products', template: '%s | Auronix Commerce Shop' },
  description: 'Discover products curated by Auronix Commerce and complete your purchase on Amazon.',
  alternates: { canonical: SHOP_SITE_URL },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', url: SHOP_SITE_URL, siteName: 'Auronix Commerce Shop', title: 'Auronix Commerce Shop', description: 'Curated products to discover and purchase on Amazon.' },
  twitter: { card: 'summary', title: 'Auronix Commerce Shop', description: 'Curated Amazon product discoveries.' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
