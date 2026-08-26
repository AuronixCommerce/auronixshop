import {
  NextResponse,
} from 'next/server';

import {
  adminDb,
} from '@/lib/firebase-admin';

import {
  requireAdmin,
} from '@/lib/server-auth';

import {
  DEFAULT_GLOBAL_CONTROL,
  DEFAULT_PAGE_CONTROL,
} from '@/lib/page-controls';

function text(
  value: unknown
): string {
  return typeof value ===
    'string'
    ? value.trim()
    : '';
}

function bool(
  value: unknown
): boolean {
  return value === true;
}

function numberOrNull(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const parsed =
    Number(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function encodePath(
  path: string
): string {
  return (
    path
      .replace(/^\/+/, '')
      .replace(/\//g, '__') ||
    'home'
  );
}

function normalizePages(
  value: unknown
) {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return {};
  }

  const result:
    Record<
      string,
      any
    > = {};

  for (
    const [
      key,
      raw,
    ] of Object.entries(
      value as Record<
        string,
        any
      >
    )
  ) {
    if (
      !raw ||
      typeof raw !==
        'object'
    ) {
      continue;
    }

    const path =
      typeof raw.path ===
      'string'
        ? raw.path
        : key === 'home'
        ? '/'
        : '/' +
          key
            .split('__')
            .filter(Boolean)
            .join('/');

    result[
      path
    ] = {
      ...DEFAULT_PAGE_CONTROL,
      ...raw,
      path,
    };
  }

  return result;
}

async function audit(
  action: string,
  path: string,
  details: Record<string, unknown>
) {
  const id =
    `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

  await adminDb
    .ref(
      `siteOperationsAudit/${id}`
    )
    .set({
      action,
      path,
      details,
      createdAt:
        Date.now(),
    });
}

export async function GET(
  request: Request
) {
  try {
    await requireAdmin(
      request
    );

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

    return NextResponse.json({
      success:
        true,

      global: {
        ...DEFAULT_GLOBAL_CONTROL,

        ...(data?.global ||
          {}),
      },

      pages:
        normalizePages(
          data?.pages
        ),
    });
  } catch (
    error
  ) {
    console.error(
      'Admin page controls GET failed:',
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error instanceof Error
            ? error.message
            : 'Unable to load controls.',
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    await requireAdmin(
      request
    );

    const body =
      await request.json();

    const action =
      text(
        body.action
      );

    if (
      action ===
      'global'
    ) {
      const oldSnapshot =
        await adminDb
          .ref(
            'sitePageControls/global'
          )
          .get();

      const oldValue =
        oldSnapshot.exists()
          ? oldSnapshot.val()
          : {};

      const payload = {
        ...DEFAULT_GLOBAL_CONTROL,
        ...oldValue,

        maintenanceEnabled:
          bool(
            body.maintenanceEnabled
          ),

        maintenanceTitle:
          text(
            body.maintenanceTitle
          ) ||
          DEFAULT_GLOBAL_CONTROL.maintenanceTitle,

        maintenanceMessage:
          text(
            body.maintenanceMessage
          ) ||
          DEFAULT_GLOBAL_CONTROL.maintenanceMessage,

        scheduleEnabled:
          bool(
            body.scheduleEnabled
          ),

        scheduleStartAt:
          numberOrNull(
            body.scheduleStartAt
          ),

        scheduleEndAt:
          numberOrNull(
            body.scheduleEndAt
          ),

        automaticFullSiteShutdown:
          bool(
            body.automaticFullSiteShutdown
          ),

        automaticRecovery:
          bool(
            body.automaticRecovery
          ),

        updatedAt:
          Date.now(),

        updatedBy:
          'admin',
      };

      await adminDb
        .ref(
          'sitePageControls/global'
        )
        .set(
          payload
        );

      await audit(
        'GLOBAL_SCHEDULE_UPDATED',
        '*',
        payload
      );

      return NextResponse.json({
        success:
          true,

        global:
          payload,
      });
    }

    if (
      action ===
      'page'
    ) {
      const path =
        text(
          body.path
        );

      if (
        !path
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              'Page path is required.',
          },
          {
            status: 400,
          }
        );
      }

      const key =
        encodePath(
          path
        );

      const oldSnapshot =
        await adminDb
          .ref(
            `sitePageControls/pages/${key}`
          )
          .get();

      const oldValue =
        oldSnapshot.exists()
          ? oldSnapshot.val()
          : {};

      const payload = {
        ...DEFAULT_PAGE_CONTROL,
        ...oldValue,

        path,

        maintenanceEnabled:
          bool(
            body.maintenanceEnabled
          ),

        maintenanceTitle:
          text(
            body.maintenanceTitle
          ) ||
          DEFAULT_PAGE_CONTROL.maintenanceTitle,

        maintenanceMessage:
          text(
            body.maintenanceMessage
          ) ||
          DEFAULT_PAGE_CONTROL.maintenanceMessage,

        scheduleEnabled:
          bool(
            body.scheduleEnabled
          ),

        scheduleStartAt:
          numberOrNull(
            body.scheduleStartAt
          ),

        scheduleEndAt:
          numberOrNull(
            body.scheduleEndAt
          ),

        popupEnabled:
          bool(
            body.popupEnabled
          ),

        popupTitle:
          text(
            body.popupTitle
          ) ||
          DEFAULT_PAGE_CONTROL.popupTitle,

        popupMessage:
          text(
            body.popupMessage
          ),

        popupButtonText:
          text(
            body.popupButtonText
          ) ||
          DEFAULT_PAGE_CONTROL.popupButtonText,

        popupButtonUrl:
          text(
            body.popupButtonUrl
          ),

        popupFrequency:
          body.popupFrequency ===
            'once' ||
          body.popupFrequency ===
            'always'
            ? body.popupFrequency
            : 'session',

        popupUntilAt:
          numberOrNull(
            body.popupUntilAt
          ),

        automaticMaintenanceEnabled:
          body.automaticMaintenanceEnabled !==
          false,

        automaticRecoveryEnabled:
          bool(
            body.automaticRecoveryEnabled
          ),

        failureThreshold:
          Math.max(
            1,
            Math.min(
              10,
              Number(
                body.failureThreshold
              ) ||
                3
            )
          ),

        adminBypassEnabled:
          body.adminBypassEnabled !==
          false,

        updatedAt:
          Date.now(),

        updatedBy:
          'admin',
      };

      await adminDb
        .ref(
          `sitePageControls/pages/${key}`
        )
        .set(
          payload
        );

      await audit(
        'PAGE_SCHEDULE_UPDATED',
        path,
        payload
      );

      return NextResponse.json({
        success:
          true,

        page:
          payload,
      });
    }

    return NextResponse.json(
      {
        success:
          false,

        error:
          'Invalid action.',
      },
      {
        status: 400,
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Admin page controls POST failed:',
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error instanceof Error
            ? error.message
            : 'Unable to update controls.',
      },
      {
        status: 500,
      }
    );
  }
}
