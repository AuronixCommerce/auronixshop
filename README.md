# Auronix Commerce

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-8etxu78m)

## Production environment

Configure these values in Vercel for Preview and Production. Never commit mailbox or Firebase credentials.

- `NEXT_PUBLIC_SITE_URL=https://auronixcommerce.com`
- `APP_URL=https://auronixcommerce.com` (legacy server-side fallback)
- `SMTP_HOST` (for example, `smtp.hostinger.com`)
- `SMTP_PORT` (`465` for implicit TLS or `587` for STARTTLS)
- `SMTP_SECURE=true` for port 465; `false` for port 587
- `SMTP_USER` (the authenticated mailbox)
- `SMTP_PASSWORD` (the mailbox/app password)
- `MAIL_NOTIFICATION_FROM=notifications@auronixcommerce.com`
- `MAIL_BUSINESS_FROM=business@auronixcommerce.com`
- `MAIL_REPLY_TO` (the monitored support or business inbox)
- `NEXT_PUBLIC_SUPPORT_EMAIL` (the public support address)
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- Existing `NEXT_PUBLIC_FIREBASE_*` client/database values

The SMTP provider must authorize the configured From addresses for the authenticated domain. Password-reset and seller-invitation messages use `MAIL_NOTIFICATION_FROM`; human support and business replies use `MAIL_BUSINESS_FROM` with `MAIL_REPLY_TO`.

After changing environment values, redeploy so server routes receive them.
