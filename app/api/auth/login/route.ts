import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, getAuthSecret, SESSION_COOKIE_NAME, TOKEN_MAX_AGE_SECONDS } from '@/lib/auth/token';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.QUOTAKEEPER_PASSWORD;

    if (!correctPassword) {
      console.error('[QuotaKeeper] Server error: QUOTAKEEPER_PASSWORD is not configured in .env');
      return NextResponse.json(
        { success: false, error: 'Authentication is not configured on the server. Please set QUOTAKEEPER_PASSWORD in .env' },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    if (password !== correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate cryptographically signed session token
    const token = await createSessionToken(getAuthSecret());

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set secure httpOnly cookie - cannot be accessed or forged by browser JS or console scripts
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('[QuotaKeeper] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
