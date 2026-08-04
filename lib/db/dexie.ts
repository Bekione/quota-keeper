import Dexie, { type Table } from 'dexie';
import { Account } from '@/types/account';
import { SyncOperation } from '@/types/sync';

export interface AccountDb extends Account {
  id: string;
}

export interface SyncOperationDb extends SyncOperation {
  id: string;
}

export class QuotaKeeperDB extends Dexie {
  accounts!: Table<AccountDb>;
  syncQueue!: Table<SyncOperationDb>;

  constructor() {
    super('QuotaKeeperDB');
    this.version(1).stores({
      accounts: 'id, email, unlock_at',
      syncQueue: '++id, timestamp',
    });
  }
}

export const db = new QuotaKeeperDB();
