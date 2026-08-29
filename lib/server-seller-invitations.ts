import { createHash, randomBytes } from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

export const INVITATION_TTL_MS = 48 * 60 * 60 * 1000;
export const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();
export const hashInvitationToken = (token: string) => createHash('sha256').update(token.trim()).digest('hex');

export async function issueSellerInvitation(applicationId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + INVITATION_TTL_MS;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || 'https://auronixcommerce.com').replace(/\/+$/, '');
  const invitationUrl = `${baseUrl}/seller/activate/${encodeURIComponent(token)}`;
  await adminDb.ref(`sellerApplications/${applicationId}`).update({
    status: 'invited', invitationTokenHash: hashInvitationToken(token), invitationExpires: expiresAt,
    invitationUsedAt: null, invitationUrl, updatedAt: Date.now(),
  });
  return { invitationUrl, expiresAt };
}
