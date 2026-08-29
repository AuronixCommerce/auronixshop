import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexSeo('Secure Link | Auronix Commerce', 'Secure Auronix Commerce link redirect.', '/go');

export default function GoLayout({ children }: { children: React.ReactNode }) { return children; }
