import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { normalizePhone } from '@/lib/seller-whatsapp';
import { normalizeEmail } from '@/lib/server-seller-invitations';

export const runtime = 'nodejs';

const SELLER_POLICY_VERSION = '2026-08-15';
const APPLICATION_VERSION = 'seller-application-v6-whatsapp';
const ACTIVE_APPLICATION_STATUSES = new Set(['pending', 'screening', 'approved', 'invited', 'active']);
const emailKey = (email: string) => createHash('sha256').update(email).digest('hex');

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = body?.form || {};
    const verificationId = text(body?.verificationId);

    if (!verificationId) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp verification is required before submitting your seller application.' },
        { status: 403 }
      );
    }

    const required: Array<[string, string]> = [
      ['Full Name', text(form.fullName)],
      ['Business Name', text(form.businessName)],
      ['Business Email', text(form.businessEmail)],
      ['Personal Email', text(form.personalEmail)],
      ['Phone', text(form.phone)],
      ['Country', text(form.country)],
      ['Street Address', text(form.address)],
      ['City', text(form.city)],
      ['State / Province', text(form.state)],
      ['ZIP / Postal Code', text(form.zipCode)],
      ['Business Type', text(form.businessType)],
      ['Product Categories', text(form.productCategories)],
      ['Business Information', text(form.businessInformation)],
      ['Why do you want to work with Auronix?', text(form.whyWorkWithAuronix)],
    ];

    for (const [label, value] of required) {
      if (!value) {
        return NextResponse.json({ success: false, error: `${label} is required.` }, { status: 400 });
      }
    }

    const businessEmail = normalizeEmail(form.businessEmail);
    const personalEmail = normalizeEmail(form.personalEmail);
    if (!validEmail(businessEmail) || !validEmail(personalEmail)) {
      return NextResponse.json({ success: false, error: 'Please enter valid email addresses.' }, { status: 400 });
    }

    if (form.sellerPolicyAgreement !== true || form.contactAgreement !== true) {
      return NextResponse.json({ success: false, error: 'Seller Policy and contact agreements are required.' }, { status: 400 });
    }

    const preferredContact = text(form.preferredContact);
    if (preferredContact !== 'business' && preferredContact !== 'personal') {
      return NextResponse.json({ success: false, error: 'Select your preferred contact email.' }, { status: 400 });
    }
    const preferredContactEmail = preferredContact === 'personal' ? personalEmail : businessEmail;

    for (const email of Array.from(new Set([businessEmail, personalEmail]))) {
      try {
        await adminAuth.getUserByEmail(email);
        return NextResponse.json({ success: false, error: 'A seller account already exists for this email. Sign in or reset your password instead.', code: 'SELLER_ACCOUNT_EXISTS' }, { status: 409 });
      } catch (accountError: any) {
        if (accountError?.code !== 'auth/user-not-found') throw accountError;
      }
    }

    const applicationsSnapshot = await adminDb.ref('sellerApplications').get();
    if (applicationsSnapshot.exists()) {
      for (const application of Object.values(applicationsSnapshot.val() as Record<string, any>)) {
        const emails = [application.businessEmail, application.personalEmail, application.preferredContactEmail, application.email].map(normalizeEmail);
        if (emails.some((email) => [businessEmail, personalEmail].includes(email)) && ACTIVE_APPLICATION_STATUSES.has(String(application.status || 'pending').toLowerCase())) {
          return NextResponse.json({ success: false, error: 'An active seller application already exists for this email. Check your inbox or contact support for its status.', code: 'APPLICATION_ALREADY_EXISTS' }, { status: 409 });
        }
      }
    }

    const businessInformation = text(form.businessInformation);
    const whyWorkWithAuronix = text(form.whyWorkWithAuronix);
    if (businessInformation.length < 30 || whyWorkWithAuronix.length < 20) {
      return NextResponse.json({ success: false, error: 'Please provide more detail about your business and partnership goals.' }, { status: 400 });
    }

    const yearsInBusiness = text(form.yearsInBusiness);
    if (yearsInBusiness) {
      const years = Number(yearsInBusiness);
      if (!Number.isFinite(years) || years < 0 || years > 200) {
        return NextResponse.json({ success: false, error: 'Years in Business must be between 0 and 200.' }, { status: 400 });
      }
    }

    const normalizedPhone = normalizePhone(form.phone);
    const verificationRef = adminDb.ref(`sellerWhatsappVerifications/${verificationId}`);
    const verificationSnapshot = await verificationRef.get();

    if (!verificationSnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'WhatsApp verification was not found. Please verify again.' }, { status: 403 });
    }

    const verification = verificationSnapshot.val();
    if (
      verification?.status !== 'verified' ||
      String(verification?.phone || '') !== normalizedPhone ||
      Number(verification?.verifiedAt || 0) <= 0 ||
      verification?.consumedAt
    ) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp verification is required for the phone number on this application.' },
        { status: 403 }
      );
    }

    const applicationRef = adminDb.ref('sellerApplications').push();
    const applicationId = applicationRef.key;
    if (!applicationId) throw new Error('Unable to create application ID.');

    const emailIndexRef = adminDb.ref(`sellerApplicationEmailIndex/${emailKey(preferredContactEmail)}`);
    const existingReservation = await emailIndexRef.get();
    const reservedApplicationId = String(existingReservation.val()?.applicationId || '');
    if (reservedApplicationId) {
      const reservedStatus = await adminDb.ref(`sellerApplications/${reservedApplicationId}/status`).get();
      if (!reservedStatus.exists() || !ACTIVE_APPLICATION_STATUSES.has(String(reservedStatus.val()).toLowerCase())) await emailIndexRef.remove();
    }
    const reservation = await emailIndexRef.transaction((current) => current || { applicationId, createdAt: Date.now() });
    if (!reservation.committed || reservation.snapshot.val()?.applicationId !== applicationId) {
      return NextResponse.json({ success: false, error: 'An active seller application already exists for this email.', code: 'APPLICATION_ALREADY_EXISTS' }, { status: 409 });
    }

    const timestamp = Date.now();
    const application = {
      id: applicationId,
      applicationVersion: APPLICATION_VERSION,
      source: 'seller-application',
      status: 'pending',
      fullName: text(form.fullName),
      businessName: text(form.businessName),
      businessEmail,
      personalEmail,
      preferredContactType: preferredContact,
      preferredContactEmail,
      phone: text(form.phone),
      phoneNormalized: normalizedPhone,
      country: text(form.country),
      address: text(form.address),
      city: text(form.city),
      state: text(form.state),
      zipCode: text(form.zipCode),
      website: text(form.website),
      businessType: text(form.businessType),
      yearsInBusiness,
      productCategories: text(form.productCategories),
      businessInformation,
      whyWorkWithAuronix,
      catalogUrl: text(form.catalogUrl),
      contactAgreement: true,
      sellerPolicyAgreed: true,
      sellerPolicyVersion: SELLER_POLICY_VERSION,
      sellerPolicyAgreedAt: timestamp,
      whatsappVerified: true,
      whatsappPhone: normalizedPhone,
      whatsappVerifiedAt: Number(verification.verifiedAt),
      whatsappVerificationId: verificationId,
      aiStatus: 'PENDING',
      aiScore: 0,
      aiAutoEligible: false,
      aiAutoApproved: false,
      aiScreening: null,
      accountCreated: false,
      accountCreationStatus: 'not_started',
      invitationSentAt: null,
      invitationSentBy: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      await applicationRef.set(application);
      await verificationRef.update({ consumedAt: timestamp, applicationId, updatedAt: timestamp });
    } catch (persistenceError) {
      await applicationRef.remove().catch(() => undefined);
      await emailIndexRef.transaction((current) => current?.applicationId === applicationId ? null : current).catch(() => undefined);
      throw persistenceError;
    }

    return NextResponse.json({ success: true, applicationId });
  } catch (error) {
    console.error('Seller application submission failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Unable to submit your application right now. Please retry.', code: 'APPLICATION_SUBMISSION_FAILED' },
      { status: 500 }
    );
  }
}
