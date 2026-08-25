"use client";

import { createClient } from "@/lib/supabase/client";
import {
  getSyncQueue,
  removeSyncOperation,
  updateSyncOperation,
  getQueueSize,
} from "./queue";
import { db } from "@/lib/db/dexie";
import { SyncState } from "@/types/sync";
import { showToast } from "@/components/toast";

export class SyncManager {
  private static instance: SyncManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncState: SyncState = {
    status:
      typeof navigator !== "undefined" && !navigator.onLine
        ? "offline"
        : "idle",
    queueSize: 0,
    lastSync: undefined,
  };
  private listeners: ((state: SyncState) => void)[] = [];
  private onQueueChangedHandler = () => this.handleQueueChange();

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener);
    // Push current state immediately to new subscriber
    listener(this.getState());
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

    console.log("[QuotaKeeper] Starting sync manager");

    // Attach queue change event listener
    if (typeof window !== "undefined") {
      window.addEventListener(
        "quotakeeper:sync-queue-changed",
        this.onQueueChangedHandler,
      );
    }

    // Initial sync / status check
    this.handleQueueChange();

    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 30000);

    // Network status listeners
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[QuotaKeeper] Network online, syncing");
        this.performSync();
      });

      window.addEventListener("offline", async () => {
        console.log("[QuotaKeeper] Network offline");
        const queueSize = await getQueueSize();
        this.updateState({ status: "offline", queueSize });
      });
    }
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener(
        "quotakeeper:sync-queue-changed",
        this.onQueueChangedHandler,
      );
    }
    console.log("[QuotaKeeper] Sync manager stopped");
  }

  private async handleQueueChange(): Promise<void> {
    const queueSize = await getQueueSize();
    if (!navigator.onLine) {
      this.updateState({ status: "offline", queueSize });
    } else if (queueSize > 0) {
      this.performSync();
    } else {
      this.updateState({ queueSize: 0 });
    }
  }

  private async performSync(): Promise<void> {
    const initialQueueSize = await getQueueSize();

    if (!navigator.onLine) {
      this.updateState({ status: "offline", queueSize: initialQueueSize });
      return;
    }

    try {
      const queue = await getSyncQueue();
      const queueSize = queue.length;

      if (queueSize === 0) {
        this.updateState({
          status: "synced",
          lastSync: new Date(),
          queueSize: 0,
        });
        return;
      }

      this.updateState({ status: "syncing", queueSize });

      const supabase = createClient();
      let networkErrorEncountered = false;

      // Process sync queue sequentially
      for (const operation of queue) {
        if (!navigator.onLine) {
          networkErrorEncountered = true;
          break;
        }

        if (operation.retries >= 3) {
          console.warn(
            "[QuotaKeeper] Max retries reached for operation:",
            operation.id,
          );
          await removeSyncOperation(operation.id);
          continue;
        }

        try {
          switch (operation.type) {
            case "create":
            case "update": {
              const { data, error } = await supabase
                .from("accounts")
                .upsert(operation.payload)
                .select();

              if (error) {
                throw error;
              }

              if (data && data.length > 0) {
                const serverAccount = data[0];
                await db.accounts.put({
                  ...serverAccount,
                  locked_at: serverAccount.locked_at
                    ? new Date(serverAccount.locked_at)
                    : null,
                  unlock_at: serverAccount.unlock_at
                    ? new Date(serverAccount.unlock_at)
                    : null,
                  created_at: new Date(serverAccount.created_at),
                  updated_at: new Date(serverAccount.updated_at),
                });
              }

              await removeSyncOperation(operation.id);
              break;
            }

            case "delete": {
              const { error } = await supabase
                .from("accounts")
                .delete()
                .eq("id", operation.entityId);

              if (error) {
                throw error;
              }

              await removeSyncOperation(operation.id);
              break;
            }
          }
        } catch (error: any) {
          console.error("[QuotaKeeper] Sync operation error:", error);

          // Distinguish network/offline errors from data/server errors
          const isNetworkError =
            !navigator.onLine ||
            error?.message?.includes("Failed to fetch") ||
            error?.name === "TypeError" ||
            error?.message?.includes("network") ||
            error?.status === 0;

          if (isNetworkError) {
            networkErrorEncountered = true;
            showToast({
              type: "warning",
              message: "Connection lost during sync. Changes saved locally.",
            });
            break;
          } else {
            // Data or permission error — increment retry count
            await updateSyncOperation(operation.id, {
              retries: operation.retries + 1,
              lastError: String(error?.message || error),
            });
            showToast({
              type: "error",
              message: `Sync failed: ${error?.message || "Unknown error"}`,
              action: { label: "Retry", onClick: () => this.forceSync() },
            });
          }
        }
      }

      const finalQueueSize = await getQueueSize();

      if (!navigator.onLine || networkErrorEncountered) {
        this.updateState({
          status: "offline",
          queueSize: finalQueueSize,
        });
      } else if (finalQueueSize === 0) {
        this.updateState({
          status: "synced",
          lastSync: new Date(),
          queueSize: 0,
        });
      } else {
        this.updateState({
          status: "syncing",
          queueSize: finalQueueSize,
        });
      }
    } catch (error) {
      console.error("[QuotaKeeper] Sync error:", error);
      const queueSize = await getQueueSize();
      this.updateState({
        status: !navigator.onLine ? "offline" : "error",
        queueSize,
        error: String(error),
      });
      showToast({
        type: "error",
        message: "Sync failed unexpectedly.",
        action: { label: "Retry", onClick: () => this.forceSync() },
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
