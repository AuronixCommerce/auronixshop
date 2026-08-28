import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import { maskPhone } from '@/lib/seller-whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationId = String(searchParams.get('verificationId') || '').trim();

    if (!verificationId) {
      return NextResponse.json(
        { success: false, error: 'Verification ID is required.' },
        { status: 400 }
      );
    }

    const ref = adminDb.ref(`sellerWhatsappVerifications/${verificationId}`);
    const snapshot = await ref.get();

    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Verification request was not found.' },
        { status: 404 }
      );
    }

    const value = snapshot.val();
    const now = Date.now();
    let status = String(value?.status || 'awaiting_whatsapp');

    if (
      (status === 'awaiting_whatsapp' || status === 'pending') &&
      Number(value?.expiresAt || 0) <= now
    ) {
      status = 'expired';
      await ref.update({
        status: 'expired',
        codeHash: null,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      verificationId,
      status,
      verified: status === 'verified',
      awaitingWhatsapp: status === 'awaiting_whatsapp',
      otpIssued: Boolean(value?.otpSentAt),
      maskedPhone: maskPhone(String(value?.phone || '')),
      expiresAt: Number(value?.expiresAt || 0),
      attempts: Number(value?.attempts || 0),
      otpRequestedAt: Number(value?.otpRequestedAt || 0) || null,
      otpSentAt: Number(value?.otpSentAt || 0) || null,
      verifiedAt: Number(value?.verifiedAt || 0) || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to check verification status.',
      },
      { status: 500 }
    );
  }
}
