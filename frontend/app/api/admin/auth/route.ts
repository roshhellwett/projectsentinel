import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET = process.env.ADMIN_SECRET_TOKEN || '';

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_ATTEMPTS = 5;
const ipAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries to prevent unbounded memory growth in long-running processes
  if (ipAttempts.size > 500) {
    for (const [key, val] of ipAttempts.entries()) {
      if (now > val.resetAt) {
        ipAttempts.delete(key);
      }
    }
    // If still over threshold, evict oldest entry
    if (ipAttempts.size > 500) {
      const oldestKey = ipAttempts.keys().next().value;
      if (oldestKey) ipAttempts.delete(oldestKey);
    }
  }

  const entry = ipAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
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
