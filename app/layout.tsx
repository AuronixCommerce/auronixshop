import './globals.css';
import './mobile-responsive.css';

import type {
  Metadata,
} from 'next';

import {
  Inter,
} from 'next/font/google';

import {
  Toaster,
} from '@/components/ui/toaster';

import {
  AIChat,
} from '@/components/site/ai-chat';

import {
  ScrollTextEffects,
} from '@/components/site/scroll-text-effects';

import {
  SiteAnnouncementPopup,
} from '@/components/site/site-announcement-popup';

import {
  PublicSiteChrome,
} from '@/components/site/public-site-chrome';

import {
  PublicRuntime,
} from '@/components/site/public-runtime';

const inter =
  Inter({
    subsets: [
      'latin',
    ],

    variable:
      '--font-inter',

    display:
      'swap',

    preload:
      true,
  });

export const metadata: Metadata = {
  metadataBase:
    new URL(
      process.env.NEXT_PUBLIC_SITE_URL ||
        'https://auronixcommerce.com'
    ),

  title: {
    default:
      'Auronix Commerce LLC | eCommerce, Procurement & Marketplace Operations',

    template:
      '%s | Auronix Commerce LLC',
  },

  description:
    'Auronix Commerce LLC connects quality suppliers, brands, and products through structured procurement, sourcing, distribution, and modern marketplace operations.',

  alternates: {
    canonical:
      'https://auronixcommerce.com/',
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      'max-image-preview':
        'large',

      'max-snippet':
        -1,

      'max-video-preview':
        -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={
        inter.variable
      }
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <meta
          name="theme-color"
          content="#0A0A0A"
        />
      </head>

      <body
        className="min-h-screen bg-background antialiased text-foreground"
        style={{
          fontFamily:
            'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <PublicRuntime>
          {children}
        </PublicRuntime>

        <Toaster />
      </body>
    </html>
  );
}
