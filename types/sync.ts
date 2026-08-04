export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error' | 'synced';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityId: string;
  payload: any;
  timestamp: Date;
  retries: number;
  lastError?: string;
}

export interface SyncState {
  status: SyncStatus;
  lastSync?: Date;
  queueSize: number;
  error?: string;
}
