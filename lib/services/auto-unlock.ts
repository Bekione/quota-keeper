'use client';

import { getAllAccounts, unlockAccount } from './account-service';
import { useSettings } from '@/components/modals/settings-modal';

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

    console.log('[QuotaKeeper] Starting auto-unlock service');

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
    console.log('[QuotaKeeper] Auto-unlock service stopped');
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
          account.status === 'LOCKED' &&
          account.unlock_at &&
          new Date(account.unlock_at) <= now
        ) {
          console.log('[QuotaKeeper] Auto-unlocking account:', account.name);
          await unlockAccount(account.id);
        }
      }
    } catch (error) {
      console.error('[QuotaKeeper] Auto-unlock error:', error);
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
