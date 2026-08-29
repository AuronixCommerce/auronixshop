import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexSeo('Auronix Administration', 'Private Auronix Commerce administration area.', '/admin');

export default function AdminRootLayout({ children }: { children: React.ReactNode }) { return children; }
