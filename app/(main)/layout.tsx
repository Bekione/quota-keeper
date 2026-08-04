'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SyncIndicator from '@/components/sync-indicator';
import Header from '@/components/header';
import { startSyncManager } from '@/lib/sync/sync-manager';
import { startAutoUnlock } from '@/lib/services/auto-unlock';

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { loading, authenticated } = useAuth();
  const [importExportOpen, setImportExportOpen] = useState(false);

  useEffect(() => {
    if (authenticated) {
      // Start sync manager for background synchronization
      const stopSync = startSyncManager();
      // Start auto-unlock service to check for unlocking accounts every 5 seconds
      const stopAutoUnlock = startAutoUnlock();
      return () => {
        stopSync();
        stopAutoUnlock();
      };
    }
  }, [authenticated]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0d0d0d',
        color: '#ffffff',
      }}
    >
      <Header onImportExport={() => setImportExportOpen(true)} />
      <SyncIndicator />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 16px' }}>
        {children}
      </main>
    </div>
  );
}
