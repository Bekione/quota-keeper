'use client';

import { useEffect, useState } from 'react';
import { syncManager } from '@/lib/sync/sync-manager';
import { SyncState } from '@/types/sync';

export default function SyncIndicator() {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    queueSize: 0,
  });

  useEffect(() => {
    // Initialize sync manager
    syncManager.start();

    // Subscribe to sync state changes
    const unsubscribe = syncManager.subscribe((state) => {
      setSyncState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const statusColors: Record<string, string> = {
    idle: '#a1a1aa',
    syncing: '#dbfe01',
    synced: '#86efac',
    offline: '#f87171',
    error: '#fca5a5',
  };

  const statusText: Record<string, string> = {
    idle: 'Ready',
    syncing: 'Syncing...',
    synced: 'Synced',
    offline: 'Offline',
    error: 'Sync Error',
  };

  return (
    <div
      style={{
        padding: '12px 32px',
        backgroundColor: '#171717',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColors[syncState.status],
            animation: syncState.status === 'syncing' ? 'pulse 2s infinite' : 'none',
          }}
        />
        <span style={{ color: statusColors[syncState.status] }}>
          {statusText[syncState.status]}
        </span>
        {syncState.queueSize > 0 && (
          <span style={{ color: '#a1a1aa' }}>
            • {syncState.queueSize} pending
          </span>
        )}
      </div>
      {syncState.lastSync && (
        <span style={{ color: '#71717a' }}>
          Last sync: {new Date(syncState.lastSync).toLocaleTimeString()}
        </span>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
