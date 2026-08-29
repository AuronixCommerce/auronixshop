import './globals.css';
import './mobile-responsive.css';

import type {
  Metadata,
} from 'next';

import {
  headers,
} from 'next/headers';

import {
  Inter,
} from 'next/font/google';

import {
  Toaster,
} from '@/components/ui/toaster';

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

import {
  MaintenanceShell,
} from '@/components/site/maintenance-shell';

import {
  getMaintenanceContext,
} from '@/lib/server-maintenance-context';
import { ThemeProvider } from '@/components/site/theme-provider';

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
    index: true,
    follow: true,
  },
};

function strictBoolean(
  value: unknown
) {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true' ||
    value === 'TRUE' ||
    value === 'True'
  );
}

export default async function RootLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const requestHeaders =
    headers();

  const pathname =
    requestHeaders.get(
      'x-auronix-pathname'
    ) || '/';

  /*
   * ==========================================================
   * ADMIN BYPASS
   * ==========================================================
   *
   * Admin must always remain accessible,
   * even when full-site maintenance is ON.
   */

  const isAdmin =
    pathname === '/admin' ||
    pathname.startsWith(
      '/admin/'
    );

  /*
   * ==========================================================
   * MAINTENANCE CHECK
   * ==========================================================
   */

  let maintenance:
    | Awaited<
        ReturnType<
          typeof getMaintenanceContext
        >
      >
    | null = null;

  if (
    !isAdmin &&
    !pathname.startsWith(
      '/api/'
    ) &&
    pathname !==
      '/maintenance'
  ) {
    try {
      maintenance =
        await getMaintenanceContext(
          pathname
        );
    } catch (
      error
    ) {
      console.error(
        '[Auronix Root Layout] Maintenance check failed:',
        error
      );
    }
  }

  const globalActive =
    strictBoolean(
      maintenance?.global?.active
    );

  const pageActive =
    strictBoolean(
      maintenance?.page?.active
    );

  /*
   * ==========================================================
   * ACTIVE MAINTENANCE
   * ==========================================================
   *
   * CRITICAL:
   *
   * Do NOT render:
   * - header
   * - footer
   * - public popup
   * - scroll typography
   * - PublicSiteChrome
   *
   * Only the maintenance shell.
   */

  if (
    !isAdmin &&
    (
      globalActive ||
      pageActive
    )
  ) {
    return (
      <html
        lang="en"
        className={
          inter.variable
        }
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
          className="min-h-screen bg-background antialiased"
          style={{
            fontFamily:
              'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <ThemeProvider><MaintenanceShell
            globalActive={
              globalActive
            }
            pageActive={
              pageActive
            }
            pathname={
              pathname
            }
            globalEndAt={
              maintenance?.global
                ?.endAt ??
              null
            }
            pageEndAt={
              maintenance?.page
                ?.endAt ??
              null
            }
          /></ThemeProvider>
        </body>
      </html>
    );
  }

  /*
   * ==========================================================
   * NORMAL SITE
   * ==========================================================
   */

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
        <ThemeProvider>
          <PublicRuntime>{children}</PublicRuntime>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
