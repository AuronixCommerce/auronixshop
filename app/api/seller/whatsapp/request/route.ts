import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import {
  AURONIX_WHATSAPP_NUMBER,
  maskPhone,
  normalizePhone,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_REQUESTS_PER_WINDOW,
  OTP_REQUEST_WINDOW_MS,
} from '@/lib/seller-whatsapp';

export const runtime = 'nodejs';

const REQUEST_TTL_MS = 10 * 60 * 1000;
const REQUEST_MESSAGE = 'OTP';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body?.phone);
    const now = Date.now();

    const rateRef = adminDb.ref(`sellerWhatsappRate/${phone}`);
    const rateSnapshot = await rateRef.get();
    const previous = rateSnapshot.exists() ? rateSnapshot.val() : {};
    const windowStartedAt = Number(previous?.windowStartedAt || 0);
    const withinWindow = now - windowStartedAt < OTP_REQUEST_WINDOW_MS;
    const requestCount = withinWindow ? Number(previous?.requestCount || 0) : 0;

    if (requestCount >= OTP_MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { success: false, error: 'Too many verification requests. Please try again later.' },
        { status: 429 }
      );
    }

    const verificationRef = adminDb.ref('sellerWhatsappVerifications').push();
    const verificationId = verificationRef.key;

    if (!verificationId) {
      throw new Error('Unable to create verification request.');
    }

    const expiresAt = now + REQUEST_TTL_MS;

    await Promise.all([
      verificationRef.set({
        id: verificationId,
        phone,
        codeHash: null,
        status: 'awaiting_whatsapp',
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        requestedAt: now,
        otpRequestedAt: null,
        otpSentAt: null,
        expiresAt,
        verifiedAt: null,
        consumedAt: null,
        updatedAt: now,
      }),
      adminDb.ref(`sellerWhatsappVerificationByPhone/${phone}/${verificationId}`).set(now),
      rateRef.set({
        windowStartedAt: withinWindow ? windowStartedAt : now,
        requestCount: requestCount + 1,
        updatedAt: now,
      }),
    ]);

    return NextResponse.json({
      success: true,
      verificationId,
      status: 'awaiting_whatsapp',
      maskedPhone: maskPhone(phone),
      expiresAt,
      whatsappNumber: `+${AURONIX_WHATSAPP_NUMBER}`,
      requestMessage: REQUEST_MESSAGE,
      whatsappUrl: `https://wa.me/${AURONIX_WHATSAPP_NUMBER}?text=${encodeURIComponent(REQUEST_MESSAGE)}`,
      message: 'Verification request created. Message OTP to Auronix Commerce from the same WhatsApp number to receive your code.',
    });
  } catch (error) {
    console.error('Seller WhatsApp verification request failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to start WhatsApp verification.',
      },
      { status: 400 }
    );
  }
}
