import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getAuthSecret, SESSION_COOKIE_NAME } from '@/lib/auth/token';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const secret = getAuthSecret();
    const isValid = await verifySessionToken(token, secret);

    if (!isValid) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({ authenticated: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
