import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function prepare(page: Page) { await page.addInitScript(() => localStorage.setItem('auronix-cookie-consent-v1', JSON.stringify({ essential: true, preferences: false, analytics: false, marketing: false, version: 1, updatedAt: Date.now() }))); }
for (const path of ['/', '/seller/apply', '/seller/login', '/forgot-password', '/newsletter/unsubscribe', '/privacy', '/cookie-policy']) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => { await prepare(page); await page.goto(path); await expect(page.locator('body')).toBeVisible(); const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze(); const serious = results.violations.filter(item => item.impact === 'serious' || item.impact === 'critical'); expect(serious, serious.map(item => `${item.id}: ${item.help}`).join('\n')).toEqual([]); });
}

test('keyboard navigation reaches primary interactive controls', async ({ page }) => { await prepare(page); await page.goto('/newsletter/unsubscribe'); await page.keyboard.press('Tab'); let focused = await page.evaluate(() => document.activeElement?.tagName); for (let index = 0; index < 12 && focused !== 'INPUT'; index++) { await page.keyboard.press('Tab'); focused = await page.evaluate(() => document.activeElement?.tagName); } expect(focused).toBe('INPUT'); });
