import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { protectPublicRequest, publicRequestErrorResponse } from '@/lib/server-protection';

const tokenMatches = (stored: unknown, supplied: string) => { const a = Buffer.from(createHash('sha256').update(String(stored || '')).digest('hex'), 'hex'); const b = Buffer.from(createHash('sha256').update(supplied).digest('hex'), 'hex'); return a.length === b.length && timingSafeEqual(a, b); };
async function subscriberFor(token: string) { if (token.length < 40) return null; const records = (await adminDb.ref('newsletterSubscribers').get()).val() || {}; const match = Object.entries(records as Record<string, any>).find(([, value]) => tokenMatches(value.unsubscribeToken, token)); return match ? { id: match[0], value: match[1] } : null; }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await protectPublicRequest(request, 'newsletter-preferences', body, { limit: 20, windowMs: 15 * 60_000 });
    const token = String(body?.token || '').trim();
    const subscriber = await subscriberFor(token);
    if (!subscriber) return NextResponse.json({ success: false, error: 'This preference link is invalid.' }, { status: 404 });
    if (body?.action === 'load') return NextResponse.json({ success: true, emailMasked: String(subscriber.value.email || '').replace(/^(.{2}).*(@.*)$/, '$1••••$2'), active: subscriber.value.active === true, frequency: subscriber.value.frequency || 'weekly', topics: subscriber.value.topics || { company: true, sourcing: true, sellers: true, suppliers: true } });
    const allowedFrequency = new Set(['weekly', 'monthly', 'important_only']);
    const frequency = String(body?.frequency || 'weekly');
    if (!allowedFrequency.has(frequency)) return NextResponse.json({ success: false, error: 'Select a valid email frequency.' }, { status: 400 });
    const rawTopics = body?.topics || {};
    const topics = { company: rawTopics.company === true, sourcing: rawTopics.sourcing === true, sellers: rawTopics.sellers === true, suppliers: rawTopics.suppliers === true };
    const now = Date.now();
    await Promise.all([
      adminDb.ref(`newsletterSubscribers/${subscriber.id}`).update({ frequency, topics, updatedAt: now }),
      adminDb.ref('newsletterEvents').push().set({ type: 'preferences_updated', subscriberId: subscriber.id, frequency, topics, createdAt: now }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const protectedError = publicRequestErrorResponse(error); if (protectedError) return NextResponse.json(protectedError.body, { status: protectedError.status });
    return NextResponse.json({ success: false, error: 'Unable to update newsletter preferences.' }, { status: 500 });
  }
}
