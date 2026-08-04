"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAllAccounts,
  getAvailableAccounts,
  getLockedAccounts,
} from "@/lib/services/account-service";
import { Account } from "@/types/account";
import { hydrateFromSupabase } from "@/lib/sync/hydrate";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(String(err));
      console.error("[QuotaKeeper] Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // On startup: hydrate IndexedDB from Supabase if empty, then load
    hydrateFromSupabase().then(() => refetch());
  }, [refetch]);

  return { accounts, loading, error, refetch };
}

export function useAvailableAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const data = await getAvailableAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("[QuotaKeeper] Error loading available accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { accounts, loading, refetch };
}

export function useLockedAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const data = await getLockedAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("[QuotaKeeper] Error loading locked accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { accounts, loading, refetch };
}
