"use client";

import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db/dexie";

/**
 * Hydrate/sync IndexedDB from Supabase on startup.
 *
 * Strategy:
 *  - If IndexedDB is empty → bulk download everything from Supabase
 *  - If IndexedDB has data → fetch from Supabase and merge by updated_at
 *    (newer version wins, either local or remote)
 *  - Also handles accounts that exist in Supabase but not locally
 */
export async function hydrateFromSupabase(): Promise<boolean> {
  try {
    if (!navigator.onLine) {
      console.log("[QuotaKeeper] Offline, skipping hydration");
      return false;
    }

    const supabase = createClient();

    const { data: remoteAccounts, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[QuotaKeeper] Hydration failed:", error);
      return false;
    }

    if (!remoteAccounts || remoteAccounts.length === 0) {
      console.log("[QuotaKeeper] No accounts in Supabase");
      return false;
    }

    const localAccounts = await db.accounts.toArray();
    const localMap = new Map(localAccounts.map((a) => [a.id, a]));

    let updated = 0;
    let added = 0;

    for (const remote of remoteAccounts) {
      const remoteRecord = {
        ...remote,
        locked_at: remote.locked_at ? new Date(remote.locked_at) : null,
        unlock_at: remote.unlock_at ? new Date(remote.unlock_at) : null,
        created_at: new Date(remote.created_at),
        updated_at: new Date(remote.updated_at),
      };

      const local = localMap.get(remote.id);

      if (!local) {
        // Account exists in Supabase but not locally → add it
        await db.accounts.put(remoteRecord);
        added++;
      } else {
        // Both exist — compare updated_at, newer wins
        const localTime = new Date(local.updated_at).getTime();
        const remoteTime = new Date(remote.updated_at).getTime();

        if (remoteTime > localTime) {
          await db.accounts.put(remoteRecord);
          updated++;
        }
      }
    }

    if (added > 0 || updated > 0) {
      console.log(
        `[QuotaKeeper] Hydration: added ${added}, updated ${updated} from Supabase`,
      );
      return true;
    }

    console.log("[QuotaKeeper] IndexedDB already up to date");
    return false;
  } catch (error) {
    console.error("[QuotaKeeper] Hydration error:", error);
    return false;
  }
}
