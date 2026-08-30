import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server-auth';
import { verifyAdminSession } from '@/lib/server-admin-session';
export async function GET(request: Request) { try { const decoded = await verifyIdToken(request); const session = await verifyAdminSession(decoded.uid); return NextResponse.json({ success: true, ...session }); } catch { return NextResponse.json({ success: false, valid: false }, { status: 401 }); } }
