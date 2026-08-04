import { NextRequest, NextResponse } from 'next/server';

// Simple password verification - use env var or fallback to 'quotakeeper123' for development
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const correctPassword = process.env.QUOTAKEEPER_PASSWORD || 'quotakeeper123';

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    // Simple check - in production you'd hash and compare
    if (password === correctPassword) {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[QuotaKeeper] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
