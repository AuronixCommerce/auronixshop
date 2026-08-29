import type { Metadata } from 'next';
import { buildSeo } from '@/lib/seo';

export const metadata: Metadata = buildSeo({ title: "What's New at Auronix Commerce | Platform Updates", description: 'Explore new Auronix Commerce features, seller tools, supplier workflows, security improvements, marketplace capabilities, and platform release notes.', path: '/whats-new', keywords: ['Auronix updates', 'commerce platform updates', 'seller platform features', 'supplier portal updates', 'marketplace operations news'] });

export default function WhatsNewLayout({ children }: { children: React.ReactNode }) { return children; }
