import {
  NextResponse,
} from 'next/server';

import {
  getMaintenanceContext,
} from '@/lib/server-maintenance-context';

export const runtime =
  'nodejs';

export async function GET(
  request: Request
) {
  const url =
    new URL(
      request.url
    );

  const pathname =
    url.searchParams.get(
      'path'
    ) || '/';

  /*
   * Admin is ALWAYS outside public
   * maintenance.
   */
  if (
    pathname === '/admin' ||
    pathname.startsWith(
      '/admin/'
    )
  ) {
    return NextResponse.json(
      {
        success: true,

        bypass: true,

        global: {
          active: false,
          upcoming: false,
          startAt: null,
          endAt: null,
        },

        page: {
          active: false,
          upcoming: false,
          startAt: null,
          endAt: null,
        },
      },
      {
        status: 200,

        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  try {
    const context =
      await getMaintenanceContext(
        pathname
      );

    return NextResponse.json(
      {
        success: true,

        bypass: false,

        global:
          context.global,

        page:
          context.page,

        checkedAt:
          Date.now(),
      },
      {
        status: 200,

        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      '[Auronix Maintenance Status] FAILED:',
      error
    );

    return NextResponse.json(
      {
        success: false,

        bypass: false,

        global: {
          active: false,
          upcoming: false,
          startAt: null,
          endAt: null,
        },

        page: {
          path:
            pathname,

          active: false,
          upcoming: false,
          startAt: null,
          endAt: null,
        },

        /*
         * Only exposed while developing locally.
         * Never expose database credentials.
         */
        error:
          process.env.NODE_ENV ===
          'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : 'Maintenance service unavailable.',
      },
      {
        status: 500,

        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
