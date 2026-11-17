'use client';

import { AuthSession } from '@/types/auth';

const AUTH_SESSION_KEY = 'quotakeeper_auth_session';

export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'GET',
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.authenticated;
    }
    // If server says unauthenticated, clear any stale storage
    localStorage.removeItem(AUTH_SESSION_KEY);
    return false;
  } catch {
    return false;
  }
}

export async function setSession(session: AuthSession): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_SESSION_KEY);
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
}
