import { adminDb } from '@/lib/firebase-admin';

const safe = (value: unknown, max = 500) => String(value ?? '').trim().slice(0, max);

export async function writeAuditLog(input: { actorUid?: string; actorEmail?: string; action: string; targetType: string; targetId?: string; summary?: string; metadata?: Record<string, unknown>; request?: Request }) {
  const entry = adminDb.ref('adminAuditLogs').push();
  const forwarded = input.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  await entry.set({ id: entry.key, actorUid: safe(input.actorUid, 160), actorEmail: safe(input.actorEmail, 320), action: safe(input.action, 120), targetType: safe(input.targetType, 120), targetId: safe(input.targetId, 300), summary: safe(input.summary, 1000), metadata: input.metadata || {}, ipHash: forwarded ? await hashText(forwarded) : '', userAgent: safe(input.request?.headers.get('user-agent'), 500), createdAt: Date.now() });
}

async function hashText(value: string) {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(value).digest('hex');
}

export async function reportOperationalError(scope: string, error: unknown, metadata: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error');
  const entry = adminDb.ref('operationalErrors').push();
  await entry.set({ id: entry.key, scope: safe(scope, 160), message: safe(message, 2000), metadata, status: 'open', createdAt: Date.now() }).catch(() => undefined);
  const webhook = process.env.ERROR_ALERT_WEBHOOK_URL?.trim();
  if (webhook) await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `[Auronix] ${scope}: ${message}`, scope, metadata }) }).catch(() => undefined);
}
