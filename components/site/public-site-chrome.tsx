'use client';

import {
  usePathname,
} from 'next/navigation';

import {
  Header,
} from './header';

import {
  Footer,
} from './footer';

export function PublicSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const isPrivateArea =
    pathname === null ||
    pathname.startsWith(
      '/admin'
    ) ||
    pathname.startsWith(
      '/api'
    ) ||
    pathname.startsWith(
      '/auth'
    );

  if (
    isPrivateArea
  ) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen pt-16">
        {children}
      </main>

      <Footer />
    </>
  );
}
