'use client';

import {
  usePathname,
} from 'next/navigation';

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

export function PublicRuntime({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const pathname =
    usePathname();

  /*
   * ADMIN IS COMPLETELY OUTSIDE
   * THE PUBLIC EXPERIENCE.
   */
  if (
    pathname === '/admin' ||
    pathname.startsWith(
      '/admin/'
    )
  ) {
    return (
      <>
        {children}
      </>
    );
  }

  /*
   * Maintenance page also gets a
   * clean standalone presentation.
   * Its own page renders AIChat.
   */
  if (
    pathname ===
    '/maintenance'
  ) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <>
      <PublicSiteChrome>
        {children}
      </PublicSiteChrome>

      <SiteAnnouncementPopup />

      <ScrollTextEffects />

      <AIChat />
    </>
  );
}

export default PublicRuntime;
