import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import {
  hashOtp,
  normalizePhone,
  OTP_TTL_MS,
  safeKey,
} from '@/lib/seller-whatsapp';

export const runtime = 'nodejs';

function authorized(request: Request): boolean {
  const secret = process.env.AURONIX_VERIFY_SECRET?.trim();
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const senderPhone = normalizePhone(body?.from);
    const messageId = String(body?.messageId || '').trim();
    const messageBody = String(body?.body || '').trim();

    if (!messageId || !/^OTP$/i.test(messageBody)) {
      return NextResponse.json({ success: true, handled: false, reply: null });
    }

    const processedKey = safeKey(messageId);
    const processedRef = adminDb.ref(`whatsappProcessedMessages/${processedKey}`);
    const processedSnapshot = await processedRef.get();

    if (processedSnapshot.exists()) {
      return NextResponse.json({ success: true, handled: true, duplicate: true, reply: null });
    }

    await processedRef.set({
      messageId,
      from: senderPhone,
      receivedAt: Date.now(),
    });

    const indexSnapshot = await adminDb
      .ref(`sellerWhatsappVerificationByPhone/${senderPhone}`)
      .get();

    if (!indexSnapshot.exists()) {
      return NextResponse.json({
        success: true,
        handled: true,
        reply: 'No active Auronix seller verification was found for this WhatsApp number. Return to the seller application, enter this same number, and click Verify Number first.',
      });
    }

    const ids = Object.entries(indexSnapshot.val() || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(([id]) => id);

    const now = Date.now();

    for (const verificationId of ids) {
      const verificationRef = adminDb.ref(`sellerWhatsappVerifications/${verificationId}`);
      const snapshot = await verificationRef.get();
      if (!snapshot.exists()) continue;

      const value = snapshot.val();
      const status = String(value?.status || '');

      if (status === 'verified') {
        return NextResponse.json({
          success: true,
          handled: true,
          verified: true,
          reply: 'Your WhatsApp number is already verified for your Auronix Commerce seller application.',
        });
      }

      if (status !== 'awaiting_whatsapp' && status !== 'pending') continue;

      if (Number(value?.expiresAt || 0) <= now) {
        await verificationRef.update({ status: 'expired', codeHash: null, updatedAt: now });
        continue;
      }

      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const otpExpiresAt = now + OTP_TTL_MS;

      await verificationRef.update({
        codeHash: hashOtp(verificationId, senderPhone, code),
        status: 'pending',
        attempts: 0,
        otpRequestedAt: now,
        otpSentAt: now,
        expiresAt: otpExpiresAt,
        lastMessageId: messageId,
        updatedAt: now,
      });

      return NextResponse.json({
        success: true,
        handled: true,
        verificationId,
        otpIssued: true,
        reply: [
          'Auronix Commerce seller verification',
          '',
          `Your one-time verification code is: ${code}`,
          '',
          'Enter this 6-digit code on the Auronix seller application.',
          'This code expires in 10 minutes.',
          'Do not share this code with anyone.',
        ].join('\n'),
      });
    }

    return NextResponse.json({
      success: true,
      handled: true,
      reply: 'Your Auronix seller verification request has expired. Return to the seller application and click Verify Number again.',
    });
  } catch (error) {
    console.error('Seller WhatsApp inbound OTP request failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process WhatsApp OTP request.' },
      { status: 500 }
    );
  }
}
