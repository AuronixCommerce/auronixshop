import {
  NextResponse,
} from 'next/server';

import type {
  NextRequest,
} from 'next/server';

export async function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  /*
   * ==========================================================
   * ABSOLUTE ADMIN BYPASS
   * ==========================================================
   *
   * Full website maintenance must NEVER lock
   * the administrator out.
   */

  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  ) {
    return NextResponse.next();
  }

  /*
   * Never run public maintenance middleware
   * against API routes.
   *
   * This allows:
   * /api/admin/*
   * /api/chat
   * /api/auth/*
   * etc.
   */
  if (
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  /*
   * Maintenance page must always be reachable.
   */
  if (
    pathname === '/maintenance'
  ) {
    return NextResponse.next();
  }

  /*
   * Next internals/static resources.
   */
  if (
    pathname.startsWith('/_next/')
  ) {
    return NextResponse.next();
  }

  /*
   * Common static assets.
   */
  if (
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.map')
  ) {
    return NextResponse.next();
  }

  try {
    /*
     * Ask the Node maintenance endpoint.
     *
     * Middleware itself remains Edge-compatible,
     * while Firebase/Admin SDK stays server-side.
     */
    const statusUrl =
      new URL(
        '/api/maintenance/status',
        request.url
      );

    statusUrl.searchParams.set(
      'path',
      pathname
    );

    const response =
      await fetch(
        statusUrl,
        {
          method: 'GET',

          cache:
            'no-store',

          headers: {
            'x-auronix-maintenance-check':
              'middleware',
          },
        }
      );

    if (
      !response.ok
    ) {
      return NextResponse.next();
    }

    const state =
      await response.json();

    /*
     * FULL WEBSITE MAINTENANCE
     */
    if (
      state?.global?.active ===
      true
    ) {
      const maintenanceUrl =
        request.nextUrl.clone();

      maintenanceUrl.pathname =
        '/maintenance';

      maintenanceUrl.searchParams.set(
        'path',
        pathname
      );

      maintenanceUrl.searchParams.set(
        'scope',
        'global'
      );

      return NextResponse.rewrite(
        maintenanceUrl
      );
    }

    /*
     * PAGE-LEVEL MAINTENANCE
     */
    if (
      state?.page?.active ===
      true
    ) {
      const maintenanceUrl =
        request.nextUrl.clone();

      maintenanceUrl.pathname =
        '/maintenance';

      maintenanceUrl.searchParams.set(
        'path',
        pathname
      );

      maintenanceUrl.searchParams.set(
        'scope',
        'page'
      );

      return NextResponse.rewrite(
        maintenanceUrl
      );
    }

    /*
     * Upcoming maintenance is NOT active.
     *
     * Let the normal page render.
     */
    return NextResponse.next();
  } catch (error) {
    console.error(
      '[Auronix Middleware] Maintenance check failed:',
      error
    );

    /*
     * Fail open.
     */
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match normal website routes but leave
     * Next internals/static assets out.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
