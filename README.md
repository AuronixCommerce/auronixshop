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
- `MAIL_FROM=business@auronixcommerce.com`
- `MAIL_FROM_NAME=Auronix Commerce LLC`
- `MAIL_SUPPORT_EMAIL=business@auronixcommerce.com`
- `NEXT_PUBLIC_SUPPORT_EMAIL` (the public support address)
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- Existing `NEXT_PUBLIC_FIREBASE_*` client/database values

The SMTP provider must authorize `MAIL_FROM` for the authenticated domain. All transactional messages use that sender and reply to `MAIL_SUPPORT_EMAIL`.

After changing environment values, redeploy so server routes receive them.

## Auronix Select storefront

The Amazon affiliate storefront is served from `/shop` and is rewritten to the
root path when the request hostname is `shop.auronixcommerce.com`.

- `NEXT_PUBLIC_SHOP_SITE_URL=https://shop.auronixcommerce.com`
- `NEXT_PUBLIC_AMAZON_STOREFRONT_URL=https://www.amazon.com` (change for the approved Associates marketplace)
- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` (the approved Amazon Associates tracking ID; omit locally for untagged links)
- `SHOP_PRIMARY_HOST=true` for a dedicated shop deployment so Vercel Preview and Production root URLs render the storefront

Add the shop hostname to the same deployment and point its DNS to the deployment
provider. Keep the marketplace URL and tracking ID aligned with the approved
Amazon Associates account. Product pages intentionally omit dynamic price,
availability, rating, review, discount, and seller data.

The included `vercel.json` selects the Next.js framework and makes the storefront
the primary host for this dedicated repository. In Vercel, also configure all
existing Firebase and mail variables listed above because the repository retains
the corporate and administration routes.
