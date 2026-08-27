import {
  adminDb,
} from '@/lib/firebase-admin';

import type {
  CampaignPageData,
} from '@/lib/campaign-page-schema';

export type TemporaryNewsletterLink = {
  token: string;

  url: string;

  campaignId:
    | string
    | null;

  label: string;

  title: string;

  destinationPath: string;

  createdAt: number;

  expiresAt: number;

  active: boolean;

  viewCount: number;

  lastViewedAt:
    | number
    | null;

  lastReferrer:
    | string
    | null;

  source: string;

  disabledAt:
    | number
    | null;

  pageData: CampaignPageData;

  activity?: Record<
    string,
    {
      type: string;
      createdAt: number;
      metadata?: Record<
        string,
        unknown
      >;
    }
  >;

  reservations?: Record<
    string,
    {
      id: string;
      name: string;
      email: string;
      company: string;
      phone: string;
      attendees:
        | number
        | null;
      message: string;
      notes: string;
      createdAt: number;
      status:
        | 'new'
        | 'contacted'
        | 'confirmed';
    }
  >;

  reservationCount?: number;

  lastReservationAt?:
    | number
    | null;
};

const BASE_URL =
  (
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://auronixcommerce.com'
  ).replace(
    /\/$/,
    ''
  );

function clean(
  value: unknown,
  fallback = ''
): string {
  return typeof value === 'string'
    ? value.trim()
    : fallback;
}

function optionalString(
  value: unknown
): string | null {
  const result =
    clean(value);

  return result
    ? result
    : null;
}

function safeNumber(
  value: unknown
): number {
  const result =
    Number(value);

  return Number.isFinite(
    result
  )
    ? result
    : 0;
}

function defaultCampaignPageData(
  expiresAt: number
): CampaignPageData {
  return {
    campaignName:
      'Auronix Commerce Campaign',

    pageType:
      'general',

    badge:
      'AURONIX COMMERCE',

    eyebrow:
      '',

    headline:
      'Discover what is coming next.',

    subheadline:
      'A new update from Auronix Commerce LLC.',

    description:
      '',

    primaryCtaText:
      'Learn More',

    primaryCtaUrl:
      '/',

    secondaryCtaText:
      '',

    secondaryCtaUrl:
      '',

    blocks:
      [],

    formEnabled:
      false,

    formType:
      'general',

    formTitle:
      'Get in touch',

    formDescription:
      'Submit your details and the Auronix Commerce team will follow up.',

    formSubmitText:
      'Submit',

    formFields:
      [
        'name',
        'email',
      ],

    successTitle:
      'Submission received',

    successMessage:
      'Thank you. Your submission has been received by Auronix Commerce LLC.',

    expiresAt,
  };
}

function normalizeCampaignPageData(
  input: unknown,
  expiresAt: number
): CampaignPageData {
  if (
    !input ||
    typeof input !== 'object'
  ) {
    return defaultCampaignPageData(
      expiresAt
    );
  }

  const value =
    input as Partial<CampaignPageData>;

  return {
    ...defaultCampaignPageData(
      expiresAt
    ),

    ...value,

    campaignName:
      clean(
        value.campaignName,
        'Auronix Commerce Campaign'
      ),

    pageType:
      value.pageType ||
      'general',

    badge:
      clean(
        value.badge,
        'AURONIX COMMERCE'
      ),

    eyebrow:
      clean(
        value.eyebrow
      ),

    headline:
      clean(
        value.headline,
        'Discover what is coming next.'
      ),

    subheadline:
      clean(
        value.subheadline,
        'A new update from Auronix Commerce LLC.'
      ),

    description:
      clean(
        value.description
      ),

    primaryCtaText:
      clean(
        value.primaryCtaText,
        'Learn More'
      ),

    primaryCtaUrl:
      clean(
        value.primaryCtaUrl,
        '/'
      ),

    secondaryCtaText:
      clean(
        value.secondaryCtaText
      ),

    secondaryCtaUrl:
      clean(
        value.secondaryCtaUrl
      ),

    blocks:
      Array.isArray(
        value.blocks
      )
        ? value.blocks
        : [],

    formEnabled:
      value.formEnabled ===
      true,

    formType:
      value.formType ||
      'general',

    formTitle:
      clean(
        value.formTitle,
        'Get in touch'
      ),

    formDescription:
      clean(
        value.formDescription,
        'Submit your details and the Auronix Commerce team will follow up.'
      ),

    formSubmitText:
      clean(
        value.formSubmitText,
        'Submit'
      ),

    formFields:
      Array.isArray(
        value.formFields
      )
        ? value.formFields
        : [
            'name',
            'email',
          ],

    successTitle:
      clean(
        value.successTitle,
        'Submission received'
      ),

    successMessage:
      clean(
        value.successMessage,
        'Thank you. Your submission has been received by Auronix Commerce LLC.'
      ),

    expiresAt,
  };
}

function randomToken(
  length = 8
): string {
  const characters =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let token = '';

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    token +=
      characters[
        Math.floor(
          Math.random() *
            characters.length
        )
      ];
  }

  return token;
}

export async function createTemporaryNewsletterLink(
  input: {
    campaignId?:
      | string
      | null;

    label?: string;

    title?: string;

    destinationPath?: string;

    expiresAt: number;

    pageData: CampaignPageData;
  }
): Promise<TemporaryNewsletterLink> {
  let token:
    | string
    | null =
    null;

  for (
    let attempt = 0;
    attempt < 20;
    attempt += 1
  ) {
    const candidate =
      randomToken();

    const existing =
      await adminDb
        .ref(
          `newsletterLinks/${candidate}`
        )
        .get();

    if (
      !existing.exists()
    ) {
      token =
        candidate;

      break;
    }
  }

  if (!token) {
    throw new Error(
      'Unable to generate unique campaign token.'
    );
  }

  const now =
    Date.now();

  const expiresAt =
    Number(
      input.expiresAt
    );

  const pageData =
    normalizeCampaignPageData(
      input.pageData,
      expiresAt
    );

  const record = {
    token,

    campaignId:
      optionalString(
        input.campaignId
      ),

    label:
      clean(
        input.label,
        pageData.primaryCtaText
      ),

    title:
      clean(
        input.title,
        pageData.headline
      ),

    destinationPath:
      clean(
        input.destinationPath,
        '/'
      ),

    createdAt:
      now,

    expiresAt,

    active:
      true,

    viewCount:
      0,

    lastViewedAt:
      null,

    lastReferrer:
      null,

    source:
      'ai-newsletter',

    disabledAt:
      null,

    pageData,

    activity:
      {},

    reservations:
      {},

    reservationCount:
      0,

    lastReservationAt:
      null,
  };

  await adminDb
    .ref(
      `newsletterLinks/${token}`
    )
    .set(record);

  await adminDb
    .ref(
      `newsletterLinks/${token}/activity`
    )
    .push()
    .set({
      type:
        'page-created',

      createdAt:
        now,

      metadata: {
        campaignName:
          pageData.campaignName,

        pageType:
          pageData.pageType,

        formEnabled:
          pageData.formEnabled,

        destinationPath:
          record.destinationPath,
      },
    });

  return {
    ...record,

    url:
      `${BASE_URL}/go/${token}`,
  };
}

export async function getTemporaryNewsletterLink(
  token: string
): Promise<
  TemporaryNewsletterLink | null
> {
  const normalized =
    clean(
      token
    ).toUpperCase();

  if (!normalized) {
    return null;
  }

  const snapshot =
    await adminDb
      .ref(
        `newsletterLinks/${normalized}`
      )
      .get();

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  const value =
    snapshot.val();

  if (
    !value ||
    value.active !== true
  ) {
    return null;
  }

  const expiresAt =
    safeNumber(
      value.expiresAt
    );

  if (
    expiresAt <= 0 ||
    Date.now() >=
      expiresAt
  ) {
    await adminDb
      .ref(
        `newsletterLinks/${normalized}/active`
      )
      .set(false);

    return null;
  }

  const pageData =
    normalizeCampaignPageData(
      value.pageData,
      expiresAt
    );

  return {
    token:
      normalized,

    url:
      `${BASE_URL}/go/${normalized}`,

    campaignId:
      optionalString(
        value.campaignId
      ),

    label:
      clean(
        value.label
      ),

    title:
      clean(
        value.title
      ),

    destinationPath:
      clean(
        value.destinationPath,
        '/'
      ),

    createdAt:
      safeNumber(
        value.createdAt
      ),

    expiresAt,

    active:
      value.active === true,

    viewCount:
      safeNumber(
        value.viewCount
      ),

    lastViewedAt:
      safeNumber(
        value.lastViewedAt
      ) || null,

    lastReferrer:
      optionalString(
        value.lastReferrer
      ),

    source:
      clean(
        value.source,
        'ai-newsletter'
      ),

    disabledAt:
      safeNumber(
        value.disabledAt
      ) || null,

    pageData,

    activity:
      value.activity ||
      {},

    reservations:
      value.reservations ||
      {},

    reservationCount:
      safeNumber(
        value.reservationCount
      ),

    lastReservationAt:
      safeNumber(
        value.lastReservationAt
      ) || null,
  };
}

export async function recordTemporaryNewsletterView(
  token: string,
  referrer?: string
) {
  const normalized =
    clean(
      token
    ).toUpperCase();

  if (!normalized) {
    return false;
  }

  const ref =
    adminDb.ref(
      `newsletterLinks/${normalized}`
    );

  const snapshot =
    await ref.get();

  if (
    !snapshot.exists()
  ) {
    return false;
  }

  const value =
    snapshot.val();

  if (
    !value ||
    value.active !== true
  ) {
    return false;
  }

  const expiresAt =
    safeNumber(
      value.expiresAt
    );

  if (
    expiresAt <= 0 ||
    Date.now() >=
      expiresAt
  ) {
    await ref.update({
      active:
        false,
    });

    return false;
  }

  const now =
    Date.now();

  const safeReferrer =
    optionalString(
      referrer
    );

  const viewCount =
    safeNumber(
      value.viewCount
    ) + 1;

  await ref.update({
    viewCount,

    lastViewedAt:
      now,

    lastReferrer:
      safeReferrer,
  });

  await adminDb
    .ref(
      `aiGeneratedNewsletterPages/${normalized}`
    )
    .update({
      viewCount,

      lastViewedAt:
        now,

      lastReferrer:
        safeReferrer,
    });

  await adminDb
    .ref(
      `aiGeneratedNewsletterPages/${normalized}/activity`
    )
    .push()
    .set({
      type:
        'page-view',

      createdAt:
        now,

      referrer:
        safeReferrer,
    });

  await ref
    .child(
      'activity'
    )
    .push()
    .set({
      type:
        'page-view',

      createdAt:
        now,

      metadata: {
        referrer:
          safeReferrer,
      },
    });

  return true;
}