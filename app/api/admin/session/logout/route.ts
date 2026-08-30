import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/server-admin-session';
export async function POST(request: Request) { try { const decoded = await verifyIdToken(request); const session = await verifyAdminSession(decoded.uid); if (session.id) await adminDb.ref(`adminSessions/${decoded.uid}/${session.id}`).update({ revokedAt: Date.now() }); const response = NextResponse.json({ success: true }); response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', expires: new Date(0) }); return response; } catch { const response = NextResponse.json({ success: true }); response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', expires: new Date(0) }); return response; } }
