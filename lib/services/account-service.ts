'use client';

import { db } from '@/lib/db/dexie';
import { Account, AccountInput, LockAccountInput, AccountStatus } from '@/types/account';
import { addToSyncQueue } from '@/lib/sync/queue';

// Generate a simple UUID v4-like string
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Client-side account service
// All reads come from IndexedDB, all writes go to IndexedDB + sync queue

export async function getAllAccounts(): Promise<Account[]> {
  try {
    const accounts = await db.accounts.toArray();
    return accounts.map((acc: any) => ({
      ...acc,
      locked_at: acc.locked_at ? new Date(acc.locked_at) : undefined,
      unlock_at: acc.unlock_at ? new Date(acc.unlock_at) : undefined,
      created_at: new Date(acc.created_at),
      updated_at: new Date(acc.updated_at),
    }));
  } catch (error) {
    console.error('[QuotaKeeper] Failed to get all accounts:', error);
    return [];
  }
}

export async function getAccountById(id: string): Promise<Account | null> {
  try {
    const account = await db.accounts.get(id);
    if (!account) return null;

    return {
      ...account,
      locked_at: account.locked_at ? new Date(account.locked_at) : undefined,
      unlock_at: account.unlock_at ? new Date(account.unlock_at) : undefined,
      created_at: new Date(account.created_at),
      updated_at: new Date(account.updated_at),
    };
  } catch (error) {
    console.error('[QuotaKeeper] Failed to get account by ID:', error);
    return null;
  }
}

export async function createAccount(input: AccountInput): Promise<Account | null> {
  try {
    const id = generateId();
    const now = new Date();
    
    const newAccount: Account = {
      id,
      ...input,
      status: 'AVAILABLE' as AccountStatus,
      created_at: now,
      updated_at: now,
    };

    // Save to local IndexedDB first
    await db.accounts.add(newAccount as any);

    // Queue for sync
    await addToSyncQueue('create', id, newAccount);

    return newAccount;
  } catch (error) {
    console.error('[QuotaKeeper] Failed to create account:', error);
    return null;
  }
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
  try {
    const existing = await db.accounts.get(id);
    if (!existing) return null;

    const now = new Date();
    const updated = {
      ...existing,
      ...updates,
      id, // preserve ID
      created_at: existing.created_at, // preserve created_at
      updated_at: now,
    };

    // Update in IndexedDB
    await db.accounts.put(updated as any);

    // Queue for sync
    await addToSyncQueue('update', id, updated);

    return {
      ...updated,
      locked_at: updated.locked_at ? new Date(updated.locked_at) : undefined,
      unlock_at: updated.unlock_at ? new Date(updated.unlock_at) : undefined,
      created_at: new Date(updated.created_at),
      updated_at: new Date(updated.updated_at),
    };
  } catch (error) {
    console.error('[QuotaKeeper] Failed to update account:', error);
    return null;
  }
}

export async function lockAccount(id: string, input: LockAccountInput): Promise<Account | null> {
  return updateAccount(id, {
    status: 'LOCKED' as AccountStatus,
    locked_at: new Date(),
    unlock_at: input.unlock_at,
  });
}

export async function unlockAccount(id: string): Promise<Account | null> {
  return updateAccount(id, {
    status: 'AVAILABLE' as AccountStatus,
    locked_at: undefined,
    unlock_at: undefined,
  });
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await db.accounts.delete(id);
    
    // Queue for sync
    await addToSyncQueue('delete', id, { id });

    return true;
  } catch (error) {
    console.error('[QuotaKeeper] Failed to delete account:', error);
    return false;
  }
}

export async function getAvailableAccounts(): Promise<Account[]> {
  try {
    const accounts = await getAllAccounts();
    return accounts.filter((acc) => acc.status === 'AVAILABLE');
  } catch (error) {
    console.error('[QuotaKeeper] Failed to get available accounts:', error);
    return [];
  }
}

export async function getLockedAccounts(): Promise<Account[]> {
  try {
    const accounts = await getAllAccounts();
    return accounts
      .filter((acc) => acc.status === 'LOCKED')
      .sort((a, b) => {
        const aUnlock = a.unlock_at?.getTime() ?? 0;
        const bUnlock = b.unlock_at?.getTime() ?? 0;
        return aUnlock - bUnlock;
      });
  } catch (error) {
    console.error('[QuotaKeeper] Failed to get locked accounts:', error);
    return [];
  }
}

export async function searchAccounts(query: string): Promise<Account[]> {
  try {
    const accounts = await getAllAccounts();
    const lowerQuery = query.toLowerCase();
    return accounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(lowerQuery) ||
        acc.email.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('[QuotaKeeper] Failed to search accounts:', error);
    return [];
  }
}
