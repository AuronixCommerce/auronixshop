import { NextResponse } from 'next/server';

import {
  requireAdmin,
} from '@/lib/server-auth';

import {
  generateGroqResponse,
} from '@/lib/server-groq';

const WEBSITE =
  'https://auronixcommerce.com';

const SUPPORT_EMAIL =
  'business@auronixcommerce.com';

function clean(
  value: unknown,
  max = 6000
) {
  return typeof value === 'string'
    ? value.trim().slice(0, max)
    : '';
}

function escapeHtml(
  value: string
) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(
  value: string
) {
  let html =
    escapeHtml(value);

  html =
    html.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong>$1</strong>'
    );

  html =
    html.replace(
      /\*([^*]+)\*/g,
      '<em>$1</em>'
    );

  html =
    html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" style="color:#111111;font-weight:700;text-decoration:underline;">$1</a>'
    );

  html =
    html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#111111;font-weight:700;text-decoration:underline;">$1</a>'
    );

  return html
    .split(/\n\s*\n/)
    .map(
      (paragraph) => `
        <p style="margin:0 0 20px;color:#333333;font-size:15px;line-height:1.8;">
          ${paragraph.replace(
            /\n/g,
            '<br />'
          )}
        </p>
      `
    )
    .join('');
}

function buildNewsletterHtml({
  title,
  intro,
  body,
  ctaText,
  ctaUrl,
}: {
  title: string;
  intro: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
}) {
  const safeTitle =
    escapeHtml(title);

  const safeIntro =
    escapeHtml(intro);

  const safeCtaText =
    escapeHtml(ctaText);

  const safeCtaUrl =
    /^https?:\/\//.test(ctaUrl)
      ? ctaUrl
      : WEBSITE;

  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Auronix Commerce LLC</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111111;">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safeIntro}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #eeeeee;">

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>

                    <div style="font-size:20px;font-weight:800;letter-spacing:-0.03em;">
                      AURONIX
                    </div>

                    <div style="margin-top:4px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#8b8b8b;">
                      COMMERCE LLC
                    </div>

                  </td>

                  <td align="right">

                    <div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#f5f5f5;color:#666666;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      UPDATE
                    </div>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px 18px;">

              <h1 style="margin:0;font-size:34px;line-height:1.05;letter-spacing:-0.045em;font-weight:800;">
                ${safeTitle}
              </h1>

              <p style="margin:16px 0 0;color:#666666;font-size:15px;line-height:1.75;">
                ${safeIntro}
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 36px;">

              ${markdownToHtml(body)}

              <div style="margin-top:28px;">
                <a
                  href="${safeCtaUrl}"
                  style="display:inline-block;padding:14px 22px;border-radius:12px;background:#111111;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;"
                >
                  ${safeCtaText}
                </a>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px;background:#fafafa;border-top:1px solid #eeeeee;">

              <div style="font-size:14px;font-weight:700;color:#111111;">
                Regards,
              </div>

              <div style="margin-top:5px;font-size:14px;font-weight:700;color:#111111;">
                Auronix Commerce LLC
              </div>

              <div style="margin-top:4px;font-size:13px;color:#777777;">
                eCommerce · Procurement · Marketplace Operations
              </div>

              <div style="margin-top:14px;font-size:13px;">
                <a href="${WEBSITE}" style="color:#111111;text-decoration:none;font-weight:600;">
                  ${WEBSITE}
                </a>
              </div>

              <div style="margin-top:5px;font-size:13px;">
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#111111;text-decoration:none;">
                  ${SUPPORT_EMAIL}
                </a>
              </div>

              <div style="margin-top:18px;font-size:11px;line-height:1.6;color:#999999;">
                You are receiving this message from Auronix Commerce LLC.
                Please contact us if you have questions about this communication.
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`.trim();
}

function extractJson(
  value: string
) {
  const cleaned =
    value
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

  try {
    return JSON.parse(
      cleaned
    );
  } catch {
    const start =
      cleaned.indexOf('{');

    const end =
      cleaned.lastIndexOf('}');

    if (
      start >= 0 &&
      end > start
    ) {
      return JSON.parse(
        cleaned.slice(
          start,
          end + 1
        )
      );
    }

    throw new Error(
      'AI returned invalid newsletter JSON.'
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

    const topic =
      clean(
        body?.topic,
        1200
      );

    const instructions =
      clean(
        body?.instructions,
        5000
      );

    if (!topic) {
      return NextResponse.json(
        {
          error:
            'Newsletter topic is required.',
        },
        {
          status: 400,
        }
      );
    }

    const system = `
You are the senior email marketing writer for Auronix Commerce LLC.

Website:
${WEBSITE}

Support:
${SUPPORT_EMAIL}

Create a polished professional business newsletter.

Brand:
Auronix Commerce LLC

Tone:
- premium
- confident
- modern
- professional
- concise
- trustworthy
- human
- business focused

Never invent statistics, certifications, guarantees, partnerships, revenue, customer counts, or unsupported claims.

Return ONLY valid JSON with this exact structure:

{
  "subject": "...",
  "preheader": "...",
  "title": "...",
  "intro": "...",
  "body": "...",
  "ctaText": "...",
  "ctaUrl": "https://auronixcommerce.com/..."
}

body may contain multiple paragraphs separated by blank lines.

Use Markdown inside body when useful:
**bold**
[link text](https://auronixcommerce.com/example)

Do not return HTML.

Topic:
${topic}

Additional instructions:
${instructions || 'Use your best professional judgment.'}
`;

    const result =
      await generateGroqResponse(
        system,
        `Create the newsletter for this topic: ${topic}`,
        1200
      );

    const parsed =
      extractJson(
        result
      );

    const subject =
      clean(
        parsed?.subject,
        180
      ) ||
      'Auronix Commerce Update';

    const preheader =
      clean(
        parsed?.preheader,
        240
      ) ||
      'An update from Auronix Commerce LLC.';

    const title =
      clean(
        parsed?.title,
        180
      ) ||
      subject;

    const intro =
      clean(
        parsed?.intro,
        700
      ) ||
      preheader;

    const bodyText =
      clean(
        parsed?.body,
        12000
      );

    const ctaText =
      clean(
        parsed?.ctaText,
        100
      ) ||
      'Visit Auronix Commerce';

    const ctaUrl =
      clean(
        parsed?.ctaUrl,
        500
      ) ||
      WEBSITE;

    if (!bodyText) {
      throw new Error(
        'AI generated an empty newsletter body.'
      );
    }

    const html =
      buildNewsletterHtml({
        title,
        intro,
        body:
          bodyText,
        ctaText,
        ctaUrl,
      });

    const plainText =
      `${title}

${intro}

${bodyText}

${ctaText}: ${ctaUrl}

Regards,
Auronix Commerce LLC
${WEBSITE}
${SUPPORT_EMAIL}`;

    return NextResponse.json(
      {
        success: true,

        newsletter: {
          subject,
          preheader,
          html,
          text:
            plainText,
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      '[Newsletter Generate]',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate newsletter.',
      },
      {
        status:
          error instanceof Error &&
          error.message.includes(
            'Admin'
          )
            ? 403
            : 500,
      }
    );
  }
}
