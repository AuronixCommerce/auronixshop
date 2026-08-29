import type { Metadata } from 'next';
import { buildNoIndexSeo } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexSeo('Cookie Policy Redirect | Auronix Commerce', 'Redirects to the current Auronix Commerce Cookie Policy.', '/cookies');

export default function CookiesLayout({ children }: { children: React.ReactNode }) { return children; }
