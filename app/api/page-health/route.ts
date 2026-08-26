import { NextResponse } from 'next/server';

import {
  SITE_PAGES,
} from '@/lib/site-pages';

export async function GET() {
  return NextResponse.json({
    success: true,
    pages:
      SITE_PAGES.map(
        (page) => ({
          path: page.path,
          title: page.title,
        })
      ),
  });
}
