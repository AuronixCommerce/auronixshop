import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';

function text(
  value: unknown
): string {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const path =
      text(body.path);

    if (!path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Path is required.',
        },
        { status: 400 }
      );
    }

    const eventId =
      `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;

    await adminDb
      .ref(
        `pageErrors/${eventId}`
      )
      .set({
        path,

        message:
          text(body.message) ||
          'Unknown client error.',

        stack:
          text(body.stack),

        source:
          text(body.source),

        userAgent:
          text(body.userAgent),

        createdAt:
          Date.now(),
      });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      'Page error reporting failed:',
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      { status: 200 }
    );
  }
}
