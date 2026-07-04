import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function verifyAdminAuth(request: Request): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const secretToken = process.env.ADMIN_SECRET_TOKEN;

  if (!secretToken || !token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secretToken));
    return null; // Auth succeeded
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
