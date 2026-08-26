import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot =
      await adminDb
        .ref('sitePopup')
        .get();

    if (!snapshot.exists()) {
      return NextResponse.json({
        enabled: false,
      });
    }

    const popup = snapshot.val();

    return NextResponse.json({
      enabled:
        popup?.enabled === true,
      title:
        popup?.title || '',
      eyebrow:
        popup?.eyebrow || '',
      message:
        popup?.message || '',
      buttonText:
        popup?.buttonText || '',
      buttonHref:
        popup?.buttonHref || '',
      secondaryText:
        popup?.secondaryText || '',
      secondaryHref:
        popup?.secondaryHref || '',
      showOncePerSession:
        popup?.showOncePerSession !== false,
      delay:
        Number(popup?.delay || 700),
    });
  } catch (error) {
    console.error(
      'Public popup API failed:',
      error
    );

    return NextResponse.json(
      {
        enabled: false,
      },
      {
        status: 200,
      }
    );
  }
}
