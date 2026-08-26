import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';

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

function getName(
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
    text(
      application.preferredContactType
    ).toLowerCase();

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

    const reason =
      text(
        body.reason
      ) ||
      'The application did not meet the current seller application requirements.';

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

    const name =
      getName(
        application
      );

    const preferredEmail =
      getPreferredEmail(
        application
      );

    /*
     * IMPORTANT:
     * Reject should NOT fail merely because an older
     * application has no email. The application can still
     * be rejected and recorded.
     *
     * We only use email when it is actually available.
     */
    const validEmail =
      Boolean(
        preferredEmail &&
        isValidEmail(
          preferredEmail
        )
      );

    await applicationRef.update({
      status:
        'rejected',

      rejectedAt:
        Date.now(),

      rejectedBy:
        'admin',

      rejectionReason:
        reason,

      /*
       * Keep contact information auditable.
       */
      rejectionContact: {
        name:
          name ||
          null,

        email:
          validEmail
            ? preferredEmail
            : null,
      },

      updatedAt:
        Date.now(),
    });

    /*
     * Do not make rejection depend on email delivery.
     *
     * If your existing rejection-email helper exists,
     * it can be called separately, but the application
     * must still successfully transition to rejected.
     */
    return NextResponse.json({
      success:
        true,

      rejected:
        true,

      emailAvailable:
        validEmail,
    });
  } catch (
    error
  ) {
    console.error(
      'Seller rejection failed:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to reject seller application.',
      },
      {
        status: 500,
      }
    );
  }
}
