import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';

import {
  DEFAULT_GLOBAL_CONTROL,
  DEFAULT_PAGE_CONTROL,
} from '@/lib/page-controls';

function decodeKey(
  key: string
): string {
  if (key === 'home') {
    return '/';
  }

  return (
    '/' +
    key
      .split('__')
      .filter(Boolean)
      .join('/')
  );
}

function normalizePages(
  value: unknown
) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return {};
  }

  const output: Record<string, any> = {};

  for (
    const [key, raw] of Object.entries(
      value as Record<string, any>
    )
  ) {
    if (
      !raw ||
      typeof raw !== 'object'
    ) {
      continue;
    }

    const path =
      typeof raw.path === 'string'
        ? raw.path
        : decodeKey(key);

    output[path] = {
      ...DEFAULT_PAGE_CONTROL,
      ...raw,
      path,
    };
  }

  return output;
}

export async function GET(
  request: Request
) {
  try {
    const url = new URL(
      request.url
    );

    const path =
      url.searchParams.get(
        'path'
      ) || '/';

    const snapshot =
      await adminDb
        .ref(
          'sitePageControls'
        )
        .get();

    const data =
      snapshot.exists()
        ? snapshot.val()
        : {};

    const global = {
      ...DEFAULT_GLOBAL_CONTROL,
      ...(data?.global || {}),
    };

    const pages =
      normalizePages(
        data?.pages
      );

    const page = {
      ...DEFAULT_PAGE_CONTROL,
      ...(pages[path] || {}),
      path,
    };

    const now = Date.now();

    const scheduledPages = Object.values(pages)
      .filter((item: any) => item.path !== path && item.scheduleEnabled && item.scheduleStartAt)
      .filter((item: any) => {
        const start = Number(item.scheduleStartAt);
        const end = item.scheduleEndAt ? Number(item.scheduleEndAt) : null;
        return start > now && (!end || end > start);
      })
      .sort((a: any, b: any) => Number(a.scheduleStartAt) - Number(b.scheduleStartAt))
      .slice(0, 5)
      .map((item: any) => ({
        path: String(item.path || '/'),
        title: String(item.maintenanceTitle || 'Scheduled maintenance'),
        startAt: Number(item.scheduleStartAt),
        endAt: item.scheduleEndAt ? Number(item.scheduleEndAt) : null,
      }));

    if (
      page.scheduleEnabled
    ) {
      if (
        page.scheduleStartAt &&
        now >= page.scheduleStartAt
      ) {
        page.maintenanceEnabled = true;
      }

      if (
        page.scheduleEndAt &&
        now >= page.scheduleEndAt
      ) {
        page.maintenanceEnabled = false;
      }
    }

    if (
      page.popupUntilAt &&
      now >= page.popupUntilAt
    ) {
      page.popupEnabled = false;
    }

    return NextResponse.json(
      {
        success: true,
        global,
        page,
        scheduledPages,
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error(
      'Public page controls failed:',
      error
    );

    return NextResponse.json({
      success: true,
      global:
        DEFAULT_GLOBAL_CONTROL,
      page:
        DEFAULT_PAGE_CONTROL,
    });
  }
}
