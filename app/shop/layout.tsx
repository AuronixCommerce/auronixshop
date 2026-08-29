import type { Metadata } from 'next';
import { SHOP_SITE_URL } from '@/lib/shop';

export const metadata: Metadata = {
  metadataBase: new URL(SHOP_SITE_URL),
  title: { default: 'Auronix Select | Curated Amazon Finds', template: '%s | Auronix Select' },
  description: 'A focused catalog of products to discover on Amazon, curated by Auronix Commerce.',
  alternates: { canonical: SHOP_SITE_URL },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', url: SHOP_SITE_URL, siteName: 'Auronix Select', title: 'Auronix Select | Curated Amazon Finds', description: 'A focused catalog of products to discover on Amazon.' },
  twitter: { card: 'summary', title: 'Auronix Select', description: 'A focused catalog of products to discover on Amazon.' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
