'use client';

import { createClient } from '@/lib/supabase/client';
import { getSyncQueue, removeSyncOperation, updateSyncOperation, getQueueSize } from './queue';
import { db } from '@/lib/db/dexie';
import { SyncState, SyncStatus } from '@/types/sync';

export class SyncManager {
  private static instance: SyncManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncState: SyncState = {
    status: 'idle',
    queueSize: 0,
    lastSync: undefined,
  };
  private listeners: ((state: SyncState) => void)[] = [];

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState(): SyncState {
    return { ...this.syncState };
  }

  private updateState(updates: Partial<SyncState>): void {
    this.syncState = { ...this.syncState, ...updates };
    this.listeners.forEach((listener) => listener(this.syncState));
  }

  start(): void {
    if (this.syncInterval) {
      return; // Already running
    }

    console.log('[QuotaKeeper] Starting sync manager');

    // Initial sync
    this.performSync();

    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 30000);

    // Also check network status
    window.addEventListener('online', () => {
      console.log('[QuotaKeeper] Network online, syncing');
      this.updateState({ status: 'syncing' });
      this.performSync();
    });

    window.addEventListener('offline', () => {
      console.log('[QuotaKeeper] Network offline');
      this.updateState({ status: 'offline' });
    });
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('[QuotaKeeper] Sync manager stopped');
  }

  private async performSync(): Promise<void> {
    if (!navigator.onLine) {
      this.updateState({ status: 'offline' });
      return;
    }

    try {
      const queue = await getSyncQueue();
      const queueSize = queue.length;

      if (queueSize === 0) {
        this.updateState({
          status: 'synced',
          lastSync: new Date(),
          queueSize: 0,
        });
        return;
      }

      this.updateState({ status: 'syncing', queueSize });

      const supabase = createClient();

      // Process sync queue
      for (const operation of queue) {
        if (operation.retries >= 3) {
          console.warn('[QuotaKeeper] Max retries reached for operation:', operation.id);
          await removeSyncOperation(operation.id);
          continue;
        }

        try {
          switch (operation.type) {
            case 'create':
            case 'update': {
              const { data, error } = await supabase
                .from('accounts')
                .upsert(operation.payload)
                .select();

              if (error) {
                throw error;
              }

              // Update local cache with server data if available
              if (data && data.length > 0) {
                const serverAccount = data[0];
                await db.accounts.put({
                  ...serverAccount,
                  locked_at: serverAccount.locked_at ? new Date(serverAccount.locked_at) : null,
                  unlock_at: serverAccount.unlock_at ? new Date(serverAccount.unlock_at) : null,
                  created_at: new Date(serverAccount.created_at),
                  updated_at: new Date(serverAccount.updated_at),
                });
              }

              await removeSyncOperation(operation.id);
              break;
            }

            case 'delete': {
              const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', operation.entityId);

              if (error) {
                throw error;
              }

              await removeSyncOperation(operation.id);
              break;
            }
          }
        } catch (error) {
          console.error('[QuotaKeeper] Sync operation failed:', error);

          // Increment retry count
          await updateSyncOperation(operation.id, {
            retries: operation.retries + 1,
            lastError: String(error),
          });
        }
      }

      // Final queue size check
      const finalQueueSize = await getQueueSize();
      if (finalQueueSize === 0) {
        this.updateState({
          status: 'synced',
          lastSync: new Date(),
          queueSize: 0,
        });
      } else {
        this.updateState({
          status: 'syncing',
          queueSize: finalQueueSize,
        });
      }
    } catch (error) {
      console.error('[QuotaKeeper] Sync error:', error);
      this.updateState({
        status: 'error',
        error: String(error),
      });
    }
  }

  async forceSync(): Promise<void> {
    await this.performSync();
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();

// Export function to start sync manager and return stop function
export function startSyncManager(): () => void {
  syncManager.start();
  return () => syncManager.stop();
}
