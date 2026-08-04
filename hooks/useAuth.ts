'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated, clearSession } from '@/lib/auth/session';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('[QuotaKeeper] Checking auth...');
        const isAuth = await isAuthenticated();
        console.log('[QuotaKeeper] Auth check result:', isAuth);
        setAuthenticated(isAuth);

        if (!isAuth) {
          console.log('[QuotaKeeper] Not authenticated, redirecting to login');
          router.push('/login');
        } else {
          console.log('[QuotaKeeper] Authenticated, staying on page');
        }
      } catch (error) {
        console.error('[QuotaKeeper] Auth check error:', error);
        setAuthenticated(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  async function logout() {
    try {
      await clearSession();
      router.push('/login');
    } catch (error) {
      console.error('[QuotaKeeper] Logout error:', error);
    }
  }

  return {
    authenticated,
    loading,
    logout,
  };
}
