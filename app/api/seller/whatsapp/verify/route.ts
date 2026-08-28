import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import {
  normalizePhone,
  OTP_MAX_ATTEMPTS,
  verifyOtpHash,
} from '@/lib/seller-whatsapp';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const verificationId = String(body?.verificationId || '').trim();
    const code = String(body?.code || '').trim();
    const phone = normalizePhone(body?.phone);

    if (!verificationId || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Enter the 6-digit WhatsApp OTP.' },
        { status: 400 }
      );
    }

    const verificationRef = adminDb.ref(`sellerWhatsappVerifications/${verificationId}`);
    const snapshot = await verificationRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Verification request was not found. Please send a new OTP.' },
        { status: 404 }
      );
    }

    const value = snapshot.val();
    const now = Date.now();

    if (String(value?.phone || '') !== phone) {
      return NextResponse.json(
        { success: false, error: 'The WhatsApp number does not match this verification request.' },
        { status: 400 }
      );
    }

    if (String(value?.status || '') === 'verified') {
      return NextResponse.json({ success: true, verified: true, status: 'verified' });
    }

    if (Number(value?.expiresAt || 0) <= now) {
      await verificationRef.update({ status: 'expired', codeHash: null, updatedAt: now });
      return NextResponse.json(
        { success: false, error: 'The OTP has expired. Please send a new OTP.', status: 'expired' },
        { status: 400 }
      );
    }

    const attempts = Number(value?.attempts || 0);
    if (attempts >= OTP_MAX_ATTEMPTS || String(value?.status || '') === 'failed') {
      return NextResponse.json(
        { success: false, error: 'Too many incorrect attempts. Please send a new OTP.', status: 'failed' },
        { status: 429 }
      );
    }

    const valid = verifyOtpHash(
      verificationId,
      phone,
      code,
      String(value?.codeHash || '')
    );

    if (!valid) {
      const nextAttempts = attempts + 1;
      await verificationRef.update({
        attempts: nextAttempts,
        status: nextAttempts >= OTP_MAX_ATTEMPTS ? 'failed' : 'pending',
        codeHash: nextAttempts >= OTP_MAX_ATTEMPTS ? null : value.codeHash,
        updatedAt: now,
      });

      return NextResponse.json(
        {
          success: false,
          error: nextAttempts >= OTP_MAX_ATTEMPTS
            ? 'Too many incorrect attempts. Please send a new OTP.'
            : 'Incorrect OTP. Please check the WhatsApp message and try again.',
          status: nextAttempts >= OTP_MAX_ATTEMPTS ? 'failed' : 'pending',
          attemptsRemaining: Math.max(0, OTP_MAX_ATTEMPTS - nextAttempts),
        },
        { status: 400 }
      );
    }

    await verificationRef.update({
      status: 'verified',
      verifiedAt: now,
      codeHash: null,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'verified',
    });
  } catch (error) {
    console.error('Seller WhatsApp OTP verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify WhatsApp OTP.' },
      { status: 500 }
    );
  }
}
