import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({ title: 'Become an Auronix Supplier | Supplier Partnerships', description: 'Apply to supply products to Auronix Commerce LLC. Submit your company, catalog, capabilities, product categories, and contact information for supplier partnership review.', path: '/supplier', keywords: ['become a supplier', 'supplier application', 'product supplier partnership', 'wholesale supplier opportunities', 'Auronix supplier portal', 'sell products wholesale'] });

export default function SupplierLayout({ children }: { children: React.ReactNode }) { return children; }
