import {
  adminDb,
} from '@/lib/firebase-admin';

import {
  DEFAULT_GLOBAL_CONTROL,
  DEFAULT_PAGE_CONTROL,
  isScheduleActive,
  isScheduleUpcoming,
} from '@/lib/page-controls';

function decodeKey(
  key: string
): string {
  if (
    key ===
    'home'
  ) {
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

export async function getMaintenanceContext(
  pathname = '/'
) {
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

    ...(data?.global ||
      {}),
  };

  let page =
    {
      ...DEFAULT_PAGE_CONTROL,

      path:
        pathname,
    };

  if (
    data?.pages &&
    typeof data.pages ===
      'object'
  ) {
    const pages =
      data.pages as Record<
        string,
        any
      >;

    for (
      const [
        key,
        value,
      ] of Object.entries(
        pages
      )
    ) {
      const path =
        typeof value?.path ===
        'string'
          ? value.path
          : decodeKey(
              key
            );

      if (
        path ===
        pathname
      ) {
        page = {
          ...DEFAULT_PAGE_CONTROL,

          ...value,

          path:
            pathname,
        };

        break;
      }
    }
  }

  const now =
    Date.now();

  const globalActive =
    Boolean(
      global.maintenanceEnabled ||
        (
          global.scheduleEnabled &&
          isScheduleActive(
            global.scheduleStartAt,
            global.scheduleEndAt,
            now
          )
        )
    );

  const globalUpcoming =
    Boolean(
      global.scheduleEnabled &&
        isScheduleUpcoming(
          global.scheduleStartAt,
          global.scheduleEndAt,
          now
        )
    );

  const pageActive =
    Boolean(
      page.maintenanceEnabled ||
        (
          page.scheduleEnabled &&
          isScheduleActive(
            page.scheduleStartAt,
            page.scheduleEndAt,
            now
          )
        )
    );

  const pageUpcoming =
    Boolean(
      page.scheduleEnabled &&
        isScheduleUpcoming(
          page.scheduleStartAt,
          page.scheduleEndAt,
          now
        )
    );

  return {
    now,

    global: {
      scheduled:
        global.scheduleEnabled,

      upcoming:
        globalUpcoming,

      active:
        globalActive,

      startAt:
        global.scheduleStartAt,

      endAt:
        global.scheduleEndAt,
    },

    page: {
      path:
        pathname,

      scheduled:
        page.scheduleEnabled,

      upcoming:
        pageUpcoming,

      active:
        pageActive,

      startAt:
        page.scheduleStartAt,

      endAt:
        page.scheduleEndAt,
    },
  };
}
