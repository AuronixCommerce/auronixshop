import { NextResponse } from 'next/server';

import {
  isValidNewsletterEmail,
  subscribeToNewsletter,
} from '@/lib/server-newsletter';

export async function POST(
  request: Request
) {
  try {
    const contentType =
      request.headers.get(
        'content-type'
      ) || '';

    if (
      !contentType.includes(
        'application/json'
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Request must use application/json.',
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const email =
      typeof body?.email ===
      'string'
        ? body.email.trim()
        : '';

    const name =
      typeof body?.name ===
      'string'
        ? body.name.trim()
        : '';

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Email address is required.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidNewsletterEmail(
        email
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Please enter a valid email address.',
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await subscribeToNewsletter(
        email,
        name,
        'footer'
      );

    return NextResponse.json(
      {
        success: true,

        alreadySubscribed:
          Boolean(
            result.alreadySubscribed
          ),
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store',
        },
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Newsletter subscription API error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to subscribe to the newsletter.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control':
            'no-store',
        },
      }
    );
  }
}
