import Dexie, { type Table } from "dexie";
import { Account } from "@/types/account";
import { SyncOperation } from "@/types/sync";

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
    super("QuotaKeeperDB");
    this.version(1).stores({
      accounts: "id, email, unlock_at",
      syncQueue: "++id, timestamp",
    });

    // v2: Recreate syncQueue with explicit string id (not auto-increment).
    // IndexedDB cannot change primary key type, so we delete and recreate.
    this.version(2)
      .stores({
        syncQueue: null, // delete old table
      })
      .upgrade((tx) => {
        // Old table gets deleted automatically when set to null
      });

    this.version(3).stores({
      accounts: "id, email, unlock_at",
      syncQueue: "id, entityId, timestamp",
    });
  }
}

export const db = new QuotaKeeperDB();
