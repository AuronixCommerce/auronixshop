import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import {
  hashOtp,
  maskPhone,
  normalizePhone,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_REQUESTS_PER_WINDOW,
  OTP_REQUEST_WINDOW_MS,
  OTP_TTL_MS,
} from '@/lib/seller-whatsapp';

export const runtime = 'nodejs';

const DEFAULT_WORKER_URL = 'http://157.245.194.148:5016';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body?.phone);
    const now = Date.now();

    const sharedSecret =
      process.env.AURONIX_VERIFY_SECRET?.trim() ||
      process.env.SELLER_WHATSAPP_OTP_SECRET?.trim();

    if (!sharedSecret) {
      throw new Error('Auronix WhatsApp verification secret is not configured.');
    }

    const workerUrl = (process.env.WHATSAPP_WORKER_URL || DEFAULT_WORKER_URL).replace(/\/$/, '');

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

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = now + OTP_TTL_MS;

    await verificationRef.set({
      id: verificationId,
      phone,
      codeHash: hashOtp(verificationId, phone, code),
      status: 'pending',
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      requestedAt: now,
      expiresAt,
      verifiedAt: null,
      consumedAt: null,
      updatedAt: now,
    });

    const workerResponse = await fetch(`${workerUrl}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharedSecret}`,
      },
      body: JSON.stringify({
        phone,
        code,
        verificationId,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const workerData = await workerResponse.json().catch(() => ({}));

    if (!workerResponse.ok) {
      await verificationRef.update({
        status: 'send_failed',
        codeHash: null,
        updatedAt: Date.now(),
      });

      throw new Error(
        workerData?.error ||
        'Unable to send the WhatsApp OTP right now. Please try again.'
      );
    }

    await Promise.all([
      verificationRef.update({
        sentAt: Date.now(),
        whatsappMessageId: workerData?.messageId || null,
        updatedAt: Date.now(),
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
      status: 'pending',
      maskedPhone: maskPhone(phone),
      expiresAt,
      message: 'OTP sent on WhatsApp.',
    });
  } catch (error) {
    console.error('Seller WhatsApp OTP request failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to send WhatsApp OTP.',
      },
      { status: 400 }
    );
  }
}
