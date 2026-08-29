import nodemailer from 'nodemailer';
import crypto from 'crypto';

import { adminDb } from '@/lib/firebase-admin';

const SMTP_HOST =
  process.env.SMTP_HOST ||
  'smtp.gmail.com';

const SMTP_PORT =
  Number(
    process.env.SMTP_PORT ||
      587
  );

const SMTP_USER =
  process.env.SMTP_USER ||
  '';

const SMTP_PASSWORD =
  process.env.SMTP_PASSWORD ||
  '';

const SUPPORT_EMAIL =
  process.env.MAIL_SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
  SMTP_USER ||
  '';

const WEBSITE =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.AURONIX_WEBSITE ||
  'https://auronixcommerce.com';

function requireMailConfig() {
  if (
    !SMTP_USER ||
    !SMTP_PASSWORD
  ) {
    throw new Error(
      'Email service is not configured.'
    );
  }
}

function createTransport() {
  requireMailConfig();

  return nodemailer.createTransport({
    host:
      SMTP_HOST,

    port:
      SMTP_PORT,

    secure:
      SMTP_PORT ===
      465,

    auth: {
      user:
        SMTP_USER,

      pass:
        SMTP_PASSWORD,
    },
  });
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

function makeToken(): string {
  return crypto
    .randomBytes(32)
    .toString('hex');
}

export function normalizeNewsletterEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

export function isValidNewsletterEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function subscribeToNewsletter(
  email: string,
  name = '',
  source = 'footer'
) {
  const normalized =
    normalizeNewsletterEmail(
      email
    );

  if (
    !isValidNewsletterEmail(
      normalized
    )
  ) {
    throw new Error(
      'Please enter a valid email address.'
    );
  }

  const subscribersRef =
    adminDb.ref(
      'newsletterSubscribers'
    );

  const snapshot =
    await subscribersRef.get();

  let existingId:
    | string
    | null =
    null;

  let existingRecord:
    | Record<
        string,
        unknown
      >
    | null =
    null;

  if (
    snapshot.exists()
  ) {
    const records =
      snapshot.val() as Record<
        string,
        Record<
          string,
          unknown
        >
      >;

    for (
      const [
        id,
        record,
      ] of Object.entries(
        records
      )
    ) {
      if (
        normalizeNewsletterEmail(
          String(
            record.email ||
              ''
          )
        ) ===
        normalized
      ) {
        existingId =
          id;

        existingRecord =
          record;

        break;
      }
    }
  }

  const now =
    Date.now();

  if (
    existingId &&
    existingRecord
  ) {
    await subscribersRef
      .child(
        existingId
      )
      .update({
        email:
          normalized,

        name:
          name.trim() ||
          String(
            existingRecord.name ||
              ''
          ),

        active:
          true,

        source:
          source || 'footer',

        resubscribedAt:
          now,

        updatedAt:
          now,
      });

    return {
      success:
        true,

      alreadySubscribed:
        true,
    };
  }

  const id =
    subscribersRef.push()
      .key;

  if (!id) {
    throw new Error(
      'Unable to create newsletter subscription.'
    );
  }

  const token =
    makeToken();

  await subscribersRef
    .child(id)
    .set({
      id,

      email:
        normalized,

      name:
        name.trim(),

      active:
        true,

      source:
        source || 'footer',

      unsubscribeToken:
        token,

      subscribedAt:
        now,

      updatedAt:
        now,

      createdAt:
        now,
    });

  return {
    success:
      true,

    alreadySubscribed:
      false,
  };
}

export async function unsubscribeFromNewsletter(
  token: string
) {
  const cleanToken =
    token.trim();

  if (
    !cleanToken
  ) {
    throw new Error(
      'Invalid unsubscribe token.'
    );
  }

  const snapshot =
    await adminDb
      .ref(
        'newsletterSubscribers'
      )
      .get();

  if (
    !snapshot.exists()
  ) {
    return {
      success:
        false,
      found:
        false,
    };
  }

  const records =
    snapshot.val() as Record<
      string,
      Record<
        string,
        unknown
      >
    >;

  for (
    const [
      id,
      record,
    ] of Object.entries(
      records
    )
  ) {
    if (
      String(
        record.unsubscribeToken ||
          ''
      ) ===
      cleanToken
    ) {
      await adminDb
        .ref(
          `newsletterSubscribers/${id}`
        )
        .update({
          active:
            false,

          unsubscribedAt:
            Date.now(),

          updatedAt:
            Date.now(),
        });

      return {
        success:
          true,

        found:
          true,
      };
    }
  }

  return {
    success:
      false,

    found:
      false,
  };
}

function buildUnsubscribeUrl(
  token: string
): string {
  return `${WEBSITE.replace(
    /\/$/,
    ''
  )}/newsletter/unsubscribe?token=${encodeURIComponent(
    token
  )}`;
}

function ensureNewsletterHtml(
  html: string,
  unsubscribeUrl: string
): string {
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Auronix Commerce</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;color:#1d1d1f;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e5e5e7;border-radius:22px;overflow:hidden;">
      <div style="padding:28px 30px;border-bottom:1px solid #eeeeef;">
        <div style="font-size:18px;font-weight:700;">
          Auronix Commerce LLC
        </div>
      </div>

      <div style="padding:30px;">
        ${html}
      </div>

      <div style="padding:24px 30px;border-top:1px solid #eeeeef;color:#6e6e73;font-size:12px;line-height:1.6;">
        <p style="margin:0 0 10px;">
          You are receiving this email because you subscribed to Auronix Commerce updates.
        </p>

        <p style="margin:0;">
          <a
            href="${unsubscribeUrl}"
            style="color:#0071e3;text-decoration:none;"
          >
            Unsubscribe
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export async function sendNewsletterEmail(
  subscriber: {
    email: string;
    name?: string;
    unsubscribeToken: string;
  },
  subject: string,
  html: string,
  text: string
) {
  const transport =
    createTransport();

  const unsubscribeUrl =
    buildUnsubscribeUrl(
      subscriber.unsubscribeToken
    );

  const personalizedHtml =
    html.replace(
      /\{\{\s*name\s*\}\}/gi,
      escapeHtml(
        subscriber.name ||
          'there'
      )
    );

  const wrappedHtml =
    ensureNewsletterHtml(
      personalizedHtml,
      unsubscribeUrl
    );

  await transport.sendMail({
    from:
      `"${process.env.MAIL_FROM_NAME || 'Auronix Commerce LLC'}" <${process.env.MAIL_FROM || SMTP_USER}>`,

    to:
      subscriber.email,

    replyTo:
      SUPPORT_EMAIL,

    subject:
      subject.trim(),

    text:
      `${text.trim()}\n\nUnsubscribe: ${unsubscribeUrl}`,

    html:
      wrappedHtml,
  });
}

export async function sendNewsletterToSubscribers(
  subject: string,
  html: string,
  text: string,
  options?: {
    campaignId?: string;
    sendLimit?: number;
  }
) {
  if (
    !subject.trim() ||
    !html.trim() ||
    !text.trim()
  ) {
    throw new Error(
      'Newsletter subject and content are required.'
    );
  }

  const snapshot =
    await adminDb
      .ref(
        'newsletterSubscribers'
      )
      .get();

  if (
    !snapshot.exists()
  ) {
    return {
      total:
        0,

      sent:
        0,

      failed:
        0,
    };
  }

  const records =
    snapshot.val() as Record<
      string,
      Record<
        string,
        unknown
      >
    >;

  const activeSubscribers =
    Object.entries(
      records
    )
      .filter(
        ([, record]) =>
          record.active ===
          true &&
          isValidNewsletterEmail(
            normalizeNewsletterEmail(
              String(
                record.email ||
                  ''
              )
            )
          )
      )
      .map(
        ([id, record]) => ({
          id,

          email:
            normalizeNewsletterEmail(
              String(
                record.email
              )
            ),

          name:
            String(
              record.name ||
                ''
            ),

          unsubscribeToken:
            String(
              record.unsubscribeToken ||
                ''
            ),
        })
      );

  const limit =
    options?.sendLimit &&
    options.sendLimit > 0
      ? Math.min(
          options.sendLimit,
          activeSubscribers.length
        )
      : activeSubscribers.length;

  let sent =
    0;

  let failed =
    0;

  const failures:
    Array<{
      email: string;
      error: string;
    }> =
    [];

  for (
    const subscriber of
    activeSubscribers.slice(
      0,
      limit
    )
  ) {
    try {
      await sendNewsletterEmail(
        subscriber,
        subject,
        html,
        text
      );

      sent +=
        1;

      await adminDb
        .ref(
          `newsletterSubscribers/${subscriber.id}`
        )
        .update({
          lastEmailSentAt:
            Date.now(),

          updatedAt:
            Date.now(),
        });
    } catch (
      error
    ) {
      failed +=
        1;

      failures.push({
        email:
          subscriber.email,

        error:
          error instanceof Error
            ? error.message
            : 'Unknown email error.',
      });
    }
  }

  if (
    options?.campaignId
  ) {
    await adminDb
      .ref(
        `newsletterCampaigns/${options.campaignId}`
      )
      .update({
        completedAt:
          Date.now(),

        totalRecipients:
          activeSubscribers.length,

        sent,

        failed,

        failures,

        status:
          failed > 0 &&
          sent === 0
            ? 'failed'
            : 'sent',

        updatedAt:
          Date.now(),
      });
  }

  return {
    total:
      activeSubscribers.length,

    sent,

    failed,

    failures,
  };
}

export async function notifyNewsletterSubscribersOfSiteUpdate(
  title: string,
  summary: string,
  url: string,
  updateType:
    | 'terms'
    | 'privacy'
    | 'disclaimer'
    | 'cookies'
    | 'seller-policy'
    | 'website-update'
) {
  const subjects: Record<
    typeof updateType,
    string
  > = {
    terms:
      'Auronix Commerce — Terms of Service Update',

    privacy:
      'Auronix Commerce — Privacy Policy Update',

    disclaimer:
      'Auronix Commerce — Disclaimer Update',

    cookies:
      'Auronix Commerce — Cookie Policy Update',

    'seller-policy':
      'Auronix Commerce — Seller Policy Update',

    'website-update':
      'Auronix Commerce — Website Update',
  };

  const subject =
    subjects[
      updateType
    ];

  const html = `
    <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">
      Important website update
    </h1>

    <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">
      {{name}}, we’ve updated an Auronix Commerce page that may be relevant to you.
    </p>

    <div style="padding:18px;background:#f5f5f7;border-radius:16px;margin:20px 0;">
      <div style="font-weight:700;font-size:17px;">
        ${escapeHtml(title)}
      </div>

      <p style="margin:8px 0 0;font-size:14px;line-height:1.7;">
        ${escapeHtml(summary)}
      </p>
    </div>

    <a
      href="${url}"
      style="display:inline-block;padding:12px 18px;border-radius:999px;background:#111;color:#fff;text-decoration:none;font-weight:600;"
    >
      Review the Update
    </a>
  `;

  const text =
    `Auronix Commerce website update\n\n${title}\n\n${summary}\n\nReview: ${url}`;

  const campaignRef =
    adminDb
      .ref(
        'newsletterCampaigns'
      )
      .push();

  const campaignId =
    campaignRef.key;

  if (!campaignId) {
    throw new Error(
      'Unable to create newsletter campaign.'
    );
  }

  await campaignRef.set({
    id:
      campaignId,

    type:
      'site-update',

    updateType,

    subject,

    title,

    summary,

    url,

    createdAt:
      Date.now(),

    status:
      'sending',
  });

  return sendNewsletterToSubscribers(
    subject,
    html,
    text,
    {
      campaignId,
    }
  );
}
