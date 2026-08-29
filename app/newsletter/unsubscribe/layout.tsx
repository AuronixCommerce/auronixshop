import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe from Newsletter | Auronix Commerce',
  description: 'Securely update your Auronix Commerce newsletter email preference.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/newsletter/unsubscribe' },
};

export default function NewsletterUnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
