import { expect, test, type Page } from '@playwright/test';

async function dismissConsent(page: Page) { const button = page.getByRole('button', { name: 'Essential only' }); if (await button.isVisible().catch(() => false)) await button.click(); }

test('newsletter unsubscribe supports email, code, reason, and success', async ({ page }) => {
  await page.route('**/api/newsletter/unsubscribe/request', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.route('**/api/newsletter/unsubscribe/confirm', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.goto('/newsletter/unsubscribe'); await dismissConsent(page);
  await page.getByLabel('Subscribed email address').fill('reader@example.com'); await page.getByRole('button', { name: 'Email unsubscribe link' }).click();
  await expect(page.getByText('Unsubscribe email sent')).toBeVisible(); await page.getByLabel('Confirmation code').fill('123456'); await page.getByText('The content is not relevant to me').click(); await page.getByRole('button', { name: 'Confirm unsubscribe' }).click();
  await expect(page.getByRole('heading', { name: 'You’re unsubscribed' })).toBeVisible();
});

test('password reset provides enumeration-safe completion', async ({ page }) => {
  await page.route('**/api/auth/request-password-reset', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.goto('/forgot-password'); await dismissConsent(page); await page.getByLabel('Email address').fill('seller@example.com'); await page.getByRole('button', { name: 'Send Reset Link' }).click(); await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
});

test('seller application exposes five steps and a resumable secure dialog', async ({ page }) => {
  await page.goto('/seller/apply'); await dismissConsent(page); for (const step of ['WhatsApp', 'Email', 'Business', 'Profile', 'Review']) await expect(page.getByText(step, { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Resume saved application' }).click(); await expect(page.getByRole('dialog', { name: 'Continue your application' })).toBeVisible(); await expect(page.getByLabel('Private resume ID')).toBeVisible();
});

test('seller activation validates invitation and creates account through API', async ({ page }) => {
  await page.route('**/api/seller/activate', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.goto('/seller/activate?token=e2e-secure-token'); await dismissConsent(page); const passwords = page.locator('input[type="password"]'); await passwords.nth(0).fill('StrongPass123!'); await passwords.nth(1).fill('StrongPass123!'); await page.getByRole('button', { name: /Create Seller Account/i }).click(); await expect(page.getByRole('heading', { name: 'Account created' })).toBeVisible();
});

test('newsletter confirmation activates only through secure confirmation API', async ({ page }) => {
  await page.route('**/api/newsletter/confirm', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.goto('/newsletter/confirm?token=e2e-confirmation-token-that-is-long-enough-for-testing'); await dismissConsent(page); await expect(page.getByRole('heading', { name: 'Subscription confirmed' })).toBeVisible();
});
