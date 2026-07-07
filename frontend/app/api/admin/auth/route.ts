import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { checkRateLimit, getClientIp } from '@/lib/api/rateLimit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET = process.env.ADMIN_SECRET_TOKEN || '';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(ip, { windowMs: 60_000, maxRequests: 5, prefix: 'admin-auth' });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Admin password not configured' },
        { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }

    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }

    if (!ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Admin secret not configured' },
        { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }

    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(ADMIN_SECRET));

    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  }
}
