import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Supplier',
  description: 'Submit your company and product information to Auronix Commerce for supplier review.',
  alternates: { canonical: 'https://auronixcommerce.com/supplier' },
};

export default function SupplierLayout({ children }: { children: React.ReactNode }) { return children; }
