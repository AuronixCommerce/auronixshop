import { NextResponse } from 'next/server';

import {
  getMaintenanceContext,
} from '@/lib/server-maintenance-context';

function strictFlag(
  value: unknown
): boolean {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true' ||
    value === 'TRUE' ||
    value === 'True'
  );
}

function timestamp(
  value: unknown
): number | null {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

export const runtime = 'nodejs';

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const pathname =
      url.searchParams.get(
        'path'
      ) || '/';

    /*
     * Never expose admin maintenance
     * state as a public maintenance target.
     */
    if (
      pathname === '/admin' ||
      pathname.startsWith('/admin/')
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

    const context =
      await getMaintenanceContext(
        pathname
      );

    const global =
      context?.global || {};

    const page =
      context?.page || {};

    return NextResponse.json(
      {
        success: true,

        bypass: false,

        global: {
          active:
            strictFlag(
              global.active
            ),

          upcoming:
            strictFlag(
              global.upcoming
            ),

          startAt:
            timestamp(
              global.startAt
            ),

          endAt:
            timestamp(
              global.endAt
            ),
        },

        page: {
          active:
            strictFlag(
              page.active
            ),

          upcoming:
            strictFlag(
              page.upcoming
            ),

          startAt:
            timestamp(
              page.startAt
            ),

          endAt:
            timestamp(
              page.endAt
            ),

          path:
            typeof page.path ===
            'string'
              ? page.path
              : pathname,
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
  } catch (error) {
    console.error(
      '[Maintenance Status]',
      error
    );

    /*
     * Fail open.
     * A failure in the maintenance-check
     * service must NOT take down the site.
     */
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
            'no-store',
        },
      }
    );
  }
}
