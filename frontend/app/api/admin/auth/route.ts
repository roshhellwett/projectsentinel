/**
 * Admin authentication API
 */

import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET_TOKEN || '';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    if (!ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Admin secret not configured' },
        { status: 500 }
      );
    }
    
    // Create JWT token
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(ADMIN_SECRET));
    
    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
