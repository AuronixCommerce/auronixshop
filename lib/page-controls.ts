export type PopupFrequency =
  | 'once'
  | 'session'
  | 'always';

export type PageHealthStatus =
  | 'unknown'
  | 'healthy'
  | 'degraded'
  | 'down'
  | 'maintenance';

export interface PageControl {
  path: string;

  maintenanceEnabled: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;

  scheduleEnabled: boolean;
  scheduleStartAt: number | null;
  scheduleEndAt: number | null;

  popupEnabled: boolean;
  popupTitle: string;
  popupMessage: string;
  popupButtonText: string;
  popupButtonUrl: string;
  popupFrequency: PopupFrequency;
  popupUntilAt: number | null;

  automaticMaintenanceEnabled: boolean;
  automaticRecoveryEnabled: boolean;
  failureThreshold: number;

  adminBypassEnabled: boolean;

  healthScore: number;
  healthStatus: PageHealthStatus;
  consecutiveFailures: number;

  lastCheckedAt: number | null;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;

  lastError: string;

  updatedAt: number;
  updatedBy: string;
}

export interface GlobalControl {
  maintenanceEnabled: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;

  scheduleEnabled: boolean;
  scheduleStartAt: number | null;
  scheduleEndAt: number | null;

  automaticFullSiteShutdown: boolean;
  automaticRecovery: boolean;

  updatedAt: number;
  updatedBy: string;
}

export const DEFAULT_PAGE_CONTROL: PageControl = {
  path: '',

  maintenanceEnabled:
    false,

  maintenanceTitle:
    'This page is temporarily unavailable',

  maintenanceMessage:
    'We are making improvements to this page. Please check back shortly.',

  scheduleEnabled:
    false,

  scheduleStartAt:
    null,

  scheduleEndAt:
    null,

  popupEnabled:
    false,

  popupTitle:
    'Important update',

  popupMessage:
    '',

  popupButtonText:
    'Learn More',

  popupButtonUrl:
    '',

  popupFrequency:
    'session',

  popupUntilAt:
    null,

  automaticMaintenanceEnabled:
    true,

  automaticRecoveryEnabled:
    false,

  failureThreshold:
    3,

  adminBypassEnabled:
    true,

  healthScore:
    100,

  healthStatus:
    'unknown',

  consecutiveFailures:
    0,

  lastCheckedAt:
    null,

  lastSuccessAt:
    null,

  lastFailureAt:
    null,

  lastError:
    '',

  updatedAt:
    0,

  updatedBy:
    'system',
};

export const DEFAULT_GLOBAL_CONTROL: GlobalControl = {
  maintenanceEnabled:
    false,

  maintenanceTitle:
    'Auronix Commerce is temporarily unavailable',

  maintenanceMessage:
    'We are performing scheduled maintenance. Please check back soon.',

  scheduleEnabled:
    false,

  scheduleStartAt:
    null,

  scheduleEndAt:
    null,

  automaticFullSiteShutdown:
    false,

  automaticRecovery:
    false,

  updatedAt:
    0,

  updatedBy:
    'system',
};

export function isScheduleUpcoming(
  startAt: number | null | undefined,
  endAt: number | null | undefined,
  now = Date.now()
): boolean {
  return Boolean(
    startAt &&
      startAt > now &&
      (!endAt || endAt > startAt)
  );
}

export function isScheduleActive(
  startAt: number | null | undefined,
  endAt: number | null | undefined,
  now = Date.now()
): boolean {
  if (!startAt) {
    return false;
  }

  if (
    now <
    startAt
  ) {
    return false;
  }

  if (
    endAt &&
    now >= endAt
  ) {
    return false;
  }

  return true;
}
