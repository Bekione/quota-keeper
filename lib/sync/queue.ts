'use client';

import { db } from '@/lib/db/dexie';
import { SyncOperation } from '@/types/sync';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function addToSyncQueue(
  type: 'create' | 'update' | 'delete',
  entityId: string,
  payload: any
): Promise<void> {
  try {
    const operation: SyncOperation = {
      id: generateId(),
      type,
      entityId,
      payload,
      timestamp: new Date(),
      retries: 0,
    };

    await db.syncQueue.add(operation as any);
  } catch (error) {
    console.error('[QuotaKeeper] Failed to add sync operation:', error);
  }
}

export async function getSyncQueue(): Promise<SyncOperation[]> {
  try {
    const operations = await db.syncQueue.toArray();
    return operations.map((op: any) => ({
      ...op,
      timestamp: new Date(op.timestamp),
      lastError: op.lastError,
    }));
  } catch (error) {
    console.error('[QuotaKeeper] Failed to get sync queue:', error);
    return [];
  }
}

export async function removeSyncOperation(id: string): Promise<void> {
  try {
    await db.syncQueue.delete(id);
  } catch (error) {
    console.error('[QuotaKeeper] Failed to remove sync operation:', error);
  }
}

export async function updateSyncOperation(
  id: string,
  updates: Partial<SyncOperation>
): Promise<void> {
  try {
    const existing = await db.syncQueue.get(id);
    if (!existing) return;

    await db.syncQueue.update(id, {
      ...updates,
      timestamp: new Date(existing.timestamp),
    } as any);
  } catch (error) {
    console.error('[QuotaKeeper] Failed to update sync operation:', error);
  }
}

export async function getQueueSize(): Promise<number> {
  try {
    return await db.syncQueue.count();
  } catch (error) {
    console.error('[QuotaKeeper] Failed to get queue size:', error);
    return 0;
  }
}

export async function clearSyncQueue(): Promise<void> {
  try {
    await db.syncQueue.clear();
  } catch (error) {
    console.error('[QuotaKeeper] Failed to clear sync queue:', error);
  }
}
