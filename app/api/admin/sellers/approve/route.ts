import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendSellerInvitationEmail } from '@/lib/server-mail';

function text(
  value: unknown
): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value).trim();
  }

  return '';
}

function getApplicantName(
  application: Record<string, unknown>
): string {
  return (
    text(
      application.fullName
    ) ||
    text(
      application.name
    ) ||
    text(
      application.applicantName
    )
  );
}

function getBusinessName(
  application: Record<string, unknown>
): string {
  return (
    text(
      application.businessName
    ) ||
    text(
      application.companyName
    ) ||
    text(
      application.company
    )
  );
}

function getBusinessEmail(
  application: Record<string, unknown>
): string {
  return (
    text(
      application.businessEmail
    ) ||
    text(
      application.email
    )
  );
}

function getPersonalEmail(
  application: Record<string, unknown>
): string {
  return text(
    application.personalEmail
  );
}

function getPreferredContactType(
  application: Record<string, unknown>
): 'business' | 'personal' | '' {
  const value =
    text(
      application.preferredContactType
    ).toLowerCase();

  if (
    value ===
    'personal'
  ) {
    return 'personal';
  }

  if (
    value ===
    'business'
  ) {
    return 'business';
  }

  return '';
}

function getPreferredEmail(
  application: Record<string, unknown>
): string {
  const explicit =
    text(
      application.preferredContactEmail
    );

  if (
    explicit
  ) {
    return explicit;
  }

  const type =
    getPreferredContactType(
      application
    );

  if (
    type ===
    'personal'
  ) {
    return (
      getPersonalEmail(
        application
      ) ||
      getBusinessEmail(
        application
      )
    );
  }

  return (
    getBusinessEmail(
      application
    ) ||
    getPersonalEmail(
      application
    )
  );
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function createInvitationUrl(
  applicationId: string
): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AURONIX_WEBSITE ||
    'https://auronixcommerce.com';

  return `${base.replace(
    /\/$/,
    ''
  )}/seller/activate?applicationId=${encodeURIComponent(
    applicationId
  )}`;
}

export async function POST(
  request: Request
) {
  try {
    await requireAdmin(
      request
    );

    const body =
      await request.json();

    const applicationId =
      text(
        body.applicationId
      );

    if (
      !applicationId
    ) {
      return NextResponse.json(
        {
          error:
            'Seller application ID is required.',
        },
        {
          status: 400,
        }
      );
    }

    const applicationRef =
      adminDb.ref(
        `sellerApplications/${applicationId}`
      );

    const snapshot =
      await applicationRef.get();

    if (
      !snapshot.exists()
    ) {
      return NextResponse.json(
        {
          error:
            'Seller application was not found.',
        },
        {
          status: 404,
        }
      );
    }

    const application =
      snapshot.val() as Record<
        string,
        unknown
      >;

    const fullName =
      getApplicantName(
        application
      );

    const businessName =
      getBusinessName(
        application
      );

    const businessEmail =
      getBusinessEmail(
        application
      );

    const personalEmail =
      getPersonalEmail(
        application
      );

    const preferredType =
      getPreferredContactType(
        application
      );

    const preferredEmail =
      getPreferredEmail(
        application
      );

    /*
     * New schema requires a valid applicant name
     * and at least one valid email.
     */
    if (
      !fullName
    ) {
      return NextResponse.json(
        {
          error:
            'Application is missing the applicant name.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !preferredEmail ||
      !isValidEmail(
        preferredEmail
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Application is missing a valid seller contact email.',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Prevent accidental duplicate approval.
     */
    if (
      text(
        application.status
      ).toLowerCase() ===
        'approved' &&
      application.invitationSentAt
    ) {
      return NextResponse.json({
        success: true,

        alreadyApproved:
          true,

        invitationSent:
          true,

        email:
          preferredEmail,
      });
    }

    const invitationUrl =
      createInvitationUrl(
        applicationId
      );

    const now =
      Date.now();

    /*
     * Preserve both emails and record exactly
     * which email was selected for the seller.
     */
    await applicationRef.update({
      status:
        'approved',

      approvedAt:
        now,

      approvedBy:
        'admin',

      accountCreated:
        false,

      accountCreationStatus:
        'invitation_pending',

      preferredContactEmail:
        preferredEmail,

      preferredContactType:
        preferredType ||
        (
          preferredEmail ===
          personalEmail
            ? 'personal'
            : 'business'
        ),

      invitationUrl,

      updatedAt:
        now,
    });

    try {
      await sendSellerInvitationEmail({
        email:
          preferredEmail,

        name:
          fullName,
invitationUrl,
      });

      await applicationRef.update({
        invitationSentAt:
          Date.now(),

        invitationSentBy:
          'admin',

        invitationDestination:
          preferredEmail,

        invitationDestinationType:
          preferredType ||
          (
            preferredEmail ===
            personalEmail
              ? 'personal'
              : 'business'
          ),

        accountCreationStatus:
          'invitation_sent',

        updatedAt:
          Date.now(),
      });

      return NextResponse.json({
        success: true,

        approved:
          true,

        invitationSent:
          true,

        email:
          preferredEmail,
      });
    } catch (
      emailError
    ) {
      await applicationRef.update({
        accountCreationStatus:
          'invitation_failed',

        invitationError:
          emailError instanceof Error
            ? emailError.message
            : 'Seller invitation email failed.',

        updatedAt:
          Date.now(),
      });

      throw emailError;
    }
  } catch (
    error
  ) {
    console.error(
      'Seller approval failed:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to approve seller application.',
      },
      {
        status: 500,
      }
    );
  }
}

