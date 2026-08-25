"use client";

import { getAllAccounts, unlockAccount } from "./account-service";
import { showToast } from "@/components/toast";

export class AutoUnlockService {
  private static instance: AutoUnlockService;
  private interval: NodeJS.Timeout | null = null;
  private isEnabled = true;

  private constructor() {}

  static getInstance(): AutoUnlockService {
    if (!AutoUnlockService.instance) {
      AutoUnlockService.instance = new AutoUnlockService();
    }
    return AutoUnlockService.instance;
  }

  start(): void {
    if (this.interval) {
      return; // Already running
    }

    console.log("[QuotaKeeper] Starting auto-unlock service");

    // Request notification permission
    this.requestNotificationPermission();

    // Check immediately
    this.checkForUnlock();

    // Check every 5 seconds
    this.interval = setInterval(() => {
      this.checkForUnlock();
    }, 5000);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log("[QuotaKeeper] Auto-unlock service stopped");
  }

  private async requestNotificationPermission(): Promise<void> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      return;
    }

    if (Notification.permission !== "denied") {
      try {
        await Notification.requestPermission();
      } catch {
        console.warn("[QuotaKeeper] Notification permission request failed");
      }
    }
  }

  private async sendNotification(accountName: string): Promise<void> {
    if (typeof window === "undefined") return;
    if (Notification.permission !== "granted") return;

    try {
      // Use ServiceWorker-based notification for PWA reliability
      // This works even when the app tab is in background/minimized
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        await registration.showNotification("QuotaKeeper", {
          body: `${accountName} is now available!`,
          icon: "/android-chrome-192x192.png",
          badge: "/android-chrome-192x192.png",
          tag: `unlock-${accountName}`,
          data: { url: "/" },
        });
      } else {
        // Fallback to basic Notification API
        new Notification("QuotaKeeper", {
          body: `${accountName} is now available!`,
          icon: "/android-chrome-192x192.png",
          tag: `unlock-${accountName}`,
        });
      }
    } catch {
      console.warn("[QuotaKeeper] Failed to send notification");
    }
  }

  private async checkForUnlock(): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const accounts = await getAllAccounts();
      const now = new Date();

      for (const account of accounts) {
        if (
          account.status === "LOCKED" &&
          account.unlock_at &&
          new Date(account.unlock_at) <= now
        ) {
          console.log("[QuotaKeeper] Auto-unlocking account:", account.name);
          await unlockAccount(account.id);
          this.sendNotification(account.name);
          showToast({
            type: "success",
            message: `${account.name} has been unlocked!`,
          });
        }
      }
    } catch (error) {
      console.error("[QuotaKeeper] Auto-unlock error:", error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

export const autoUnlockService = AutoUnlockService.getInstance();

// Export function to start auto-unlock service and return stop function
export function startAutoUnlock(): () => void {
  autoUnlockService.start();
  return () => autoUnlockService.stop();
}
