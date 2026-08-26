import nodemailer from 'nodemailer';

export type EmailType = string;

export const NOTIFICATION_EMAIL =
  process.env.MAIL_NOTIFICATION_FROM ||
  'notifications@auronixcommerce.com';

export const BUSINESS_EMAIL =
  process.env.MAIL_BUSINESS_FROM ||
  'business@auronixcommerce.com';

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
  BUSINESS_EMAIL;

const SMTP_HOST =
  process.env.SMTP_HOST ||
  'smtp.hostinger.com';

const SMTP_PORT =
  Number(
    process.env.SMTP_PORT || 465
  );

const SMTP_SECURE =
  process.env.SMTP_SECURE !== 'false';

const SMTP_USER =
  process.env.SMTP_USER ||
  'notifications@auronixcommerce.com';

const SMTP_PASSWORD =
  process.env.SMTP_PASSWORD ||
  '';

const transporter =
  nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

type MailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  fromName?: string;
};

function normalizeOptions(
  value: any
): MailOptions {
  const options =
    value || {};

  return {
    to:
      options.to ||
      options.recipient ||
      options.email ||
      options.emailAddress,

    subject:
      options.subject ||
      'Auronix Commerce LLC',

    html:
      options.html ||
      options.htmlBody ||
      options.bodyHtml ||
      options.body ||
      `<p>${String(
        options.text ||
          ''
      )}</p>`,

    text:
      options.text ||
      options.bodyText,

    replyTo:
      options.replyTo ||
      SUPPORT_EMAIL,

    from:
      options.from,

    fromName:
      options.fromName,
  };
}

async function sendWithSender(
  sender: string,
  value: any
) {
  const options =
    normalizeOptions(
      value
    );

  if (!options.to) {
    throw new Error(
      'Email recipient is required.'
    );
  }

  if (!SMTP_PASSWORD) {
    throw new Error(
      'SMTP_PASSWORD is not configured.'
    );
  }

  return transporter.sendMail({
    from: {
      name:
        options.fromName ||
        'Auronix Commerce LLC',
      address:
        sender,
    },

    to:
      options.to,

    subject:
      options.subject,

    html:
      options.html,

    text:
      options.text,

    replyTo:
      options.replyTo ||
      SUPPORT_EMAIL,
  });
}

/*
 * New explicit sender helpers.
 */

export function sendNotificationMail(
  options: any
) {
  return sendWithSender(
    NOTIFICATION_EMAIL,
    options
  );
}

export function sendBusinessMail(
  options: any
) {
  return sendWithSender(
    BUSINESS_EMAIL,
    options
  );
}

/*
 * Existing compatibility API.
 *
 * These exports are intentionally preserved because
 * existing Auronix API routes already import them.
 */

export function sendProfessionalEmail(
  options: any,
  ...rest: any[]
) {
  const type =
    typeof rest[0] ===
    'string'
      ? rest[0]
      : '';

  const systemTypes = [
    'notification',
    'notifications',
    'admin',
    'sellerInvitation',
    'seller-invitation',
    'passwordReset',
    'password-reset',
  ];

  const sender =
    systemTypes.includes(
      type
    )
      ? NOTIFICATION_EMAIL
      : BUSINESS_EMAIL;

  return sendWithSender(
    sender,
    options
  );
}

export async function sendSellerInvitationEmail(
  ...args: any[]
) {
  const input =
    args.find(
      (value) =>
        value &&
        typeof value ===
          'object'
    ) || {};

  const recipient =
    input.email ||
    input.recipient ||
    input.to ||
    args.find(
      (value) =>
        typeof value ===
        'string' &&
        value.includes('@')
    );

  const name =
    input.name ||
    input.fullName ||
    input.businessName ||
    'Seller';

  const activationUrl =
    input.activationUrl ||
    input.invitationUrl ||
    input.url ||
    'https://auronixcommerce.com/seller/activate';

  return sendNotificationMail({
    to:
      recipient,

    subject:
      'Auronix Commerce LLC Seller Invitation',

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Auronix Commerce LLC</h2>
        <p>Hello ${name},</p>
        <p>
          Your seller invitation process has been initiated.
        </p>
        <p>
          <a href="${activationUrl}">
            Continue Seller Activation
          </a>
        </p>
        <p>
          If you need help, contact
          <a href="mailto:${BUSINESS_EMAIL}">
            ${BUSINESS_EMAIL}
          </a>.
        </p>
      </div>
    `,

    text:
      `Hello ${name},

Your Auronix Commerce LLC seller invitation has been initiated.

Continue activation:
${activationUrl}

Support:
${BUSINESS_EMAIL}`,
  });
}

export async function sendTicketResponseEmail(
  ...args: any[]
) {
  const input =
    args.find(
      (value) =>
        value &&
        typeof value ===
          'object'
    ) || {};

  const recipient =
    input.email ||
    input.recipient ||
    input.to ||
    args.find(
      (value) =>
        typeof value ===
        'string' &&
        value.includes('@')
    );

  const subject =
    input.subject ||
    'Auronix Commerce LLC Support Response';

  const message =
    input.message ||
    input.response ||
    input.body ||
    input.text ||
    '';

  return sendBusinessMail({
    to:
      recipient,

    subject,

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Auronix Commerce LLC Support</h2>
        <p>${String(
          message
        ).replace(
          /\n/g,
          '<br />'
        )}</p>
        <p>
          Need additional help?
          <a href="mailto:${BUSINESS_EMAIL}">
            ${BUSINESS_EMAIL}
          </a>
        </p>
      </div>
    `,

    text:
      `${message}

Support:
${BUSINESS_EMAIL}`,
  });
}

export async function sendPasswordResetEmail(
  ...args: any[]
) {
  const input =
    args.find(
      (value) =>
        value &&
        typeof value ===
          'object'
    ) || {};

  const recipient =
    input.email ||
    input.recipient ||
    input.to ||
    args.find(
      (value) =>
        typeof value ===
        'string' &&
        value.includes('@')
    );

  const resetUrl =
    input.resetUrl ||
    input.url ||
    input.link ||
    'https://auronixcommerce.com/reset-password';

  return sendNotificationMail({
    to:
      recipient,

    subject:
      'Auronix Commerce LLC Password Reset',

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Password Reset</h2>
        <p>
          A password reset was requested for your
          Auronix Commerce account.
        </p>
        <p>
          <a href="${resetUrl}">
            Reset Password
          </a>
        </p>
        <p>
          If you did not request this, you can ignore
          this email.
        </p>
      </div>
    `,

    text:
      `A password reset was requested.

Reset password:
${resetUrl}

If you did not request this, ignore this email.`,
  });
}

export async function verifyMailConnection() {
  if (!SMTP_PASSWORD) {
    throw new Error(
      'SMTP_PASSWORD is not configured.'
    );
  }

  await transporter.verify();

  return true;
}
