'use client';

import { db } from '@/lib/db/dexie';
import { AuthSession } from '@/types/auth';

const AUTH_SESSION_KEY = 'quotakeeper_auth_session';
const AUTH_SESSION_DB_KEY = 'auth_session';

export async function getSession(): Promise<AuthSession | null> {
  // Get from localStorage
  try {
    if (typeof window === 'undefined') {
      console.log('[QuotaKeeper] Running on server, no localStorage');
      return null;
    }
    const sessionStr = localStorage.getItem(AUTH_SESSION_KEY);
    console.log('[QuotaKeeper] getSession called, found:', !!sessionStr);
    if (sessionStr) {
      const session = JSON.parse(sessionStr) as AuthSession;
      console.log('[QuotaKeeper] Session retrieved:', session.authenticated);
      return session;
    }
  } catch (error) {
    console.error('[QuotaKeeper] Failed to parse session from localStorage', error);
    return null;
  }

  console.log('[QuotaKeeper] No session found in localStorage');
  return null;
}

export async function setSession(session: AuthSession): Promise<void> {
  // Store in localStorage
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  console.log('[QuotaKeeper] Session stored:', session.authenticated);
}

export async function clearSession(): Promise<void> {
  localStorage.removeItem(AUTH_SESSION_KEY);
  console.log('[QuotaKeeper] Session cleared');
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session?.authenticated ?? false;
}
