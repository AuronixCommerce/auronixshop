import { NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot =
      await adminDb
        .ref('siteChangelog')
        .get();

    if (!snapshot.exists()) {
      return NextResponse.json([]);
    }

    const value =
      snapshot.val();

    if (
      !value ||
      typeof value !== 'object'
    ) {
      return NextResponse.json([]);
    }

    const entries =
      Object.entries(value).map(
        ([id, item]) => ({
          id,
          ...(item as object),
        })
      );

    entries.sort(
      (a: any, b: any) =>
        Number(
          b.releaseDate ||
          b.createdAt ||
          0
        ) -
        Number(
          a.releaseDate ||
          a.createdAt ||
          0
        )
    );

    return NextResponse.json(
      entries.filter(
        (entry: any) =>
          entry.published !== false
      )
    );
  } catch (error) {
    console.error(
      'Public changelog API failed:',
      error
    );

    return NextResponse.json([]);
  }
}
