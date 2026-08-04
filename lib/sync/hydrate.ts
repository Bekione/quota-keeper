"use client";

import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db/dexie";

/**
 * Hydrate IndexedDB from Supabase on startup.
 * Called once when the app loads — if IndexedDB accounts table is empty,
 * download all accounts from Supabase and populate IndexedDB.
 */
export async function hydrateFromSupabase(): Promise<boolean> {
  try {
    const localCount = await db.accounts.count();

    if (localCount > 0) {
      console.log(
        "[QuotaKeeper] IndexedDB already has data, skipping hydration",
      );
      return false;
    }

    if (!navigator.onLine) {
      console.log("[QuotaKeeper] Offline, skipping hydration");
      return false;
    }

    console.log("[QuotaKeeper] IndexedDB empty, hydrating from Supabase...");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[QuotaKeeper] Hydration failed:", error);
      return false;
    }

    if (!data || data.length === 0) {
      console.log("[QuotaKeeper] No accounts in Supabase");
      return false;
    }

    // Bulk insert into IndexedDB
    await db.accounts.bulkPut(
      data.map((account: any) => ({
        ...account,
        locked_at: account.locked_at ? new Date(account.locked_at) : null,
        unlock_at: account.unlock_at ? new Date(account.unlock_at) : null,
        created_at: new Date(account.created_at),
        updated_at: new Date(account.updated_at),
      })),
    );

    console.log(`[QuotaKeeper] Hydrated ${data.length} accounts from Supabase`);
    return true;
  } catch (error) {
    console.error("[QuotaKeeper] Hydration error:", error);
    return false;
  }
}
