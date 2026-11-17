"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import HeroCard from "@/components/dashboard/hero-card";
import AccountsList from "@/components/dashboard/accounts-list";
import SearchFilter, { type SortOption } from "@/components/dashboard/search-filter";
import StatsRow from "@/components/dashboard/stats-row";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";
import AddAccountModal from "@/components/modals/add-account-modal";
import EditAccountModal from "@/components/modals/edit-account-modal";
import LockAccountModal from "@/components/modals/lock-account-modal";
import DeleteConfirmation from "@/components/modals/delete-confirmation";
import ImportExportModal from "@/components/modals/import-export-modal";
import { useAccounts } from "@/hooks/useAccounts";
import { useModal } from "@/hooks/useModal";
import { Account, AccountProvider } from "@/types/account";
import { unlockAccount } from "@/lib/services/account-service";

export default function Dashboard() {
  const { accounts, loading, refetch } = useAccounts();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "locked"
  >("all");
  const [filterProvider, setFilterProvider] = useState<AccountProvider | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

  const handleUnlock = useCallback(
    async (account: Account) => {
      await unlockAccount(account.id);
      refetch();
    },
    [refetch],
  );

  // Modal states
  const addModal = useModal();
  const editModal = useModal();
  const lockModal = useModal();
  const deleteModal = useModal();
  const importExportModal = useModal();

  // Listen for import/export trigger from Header (in layout)
  useEffect(() => {
    const handleOpenImportExport = () => importExportModal.open();
    window.addEventListener(
      "quotakeeper:open-import-export",
      handleOpenImportExport,
    );
    return () =>
      window.removeEventListener(
        "quotakeeper:open-import-export",
        handleOpenImportExport,
      );
  }, [importExportModal]);

  useEffect(() => {
    let filtered = accounts;

    // Filter by status
    if (filterStatus === "available") {
      filtered = filtered.filter((acc) => acc.status === "AVAILABLE");
    } else if (filterStatus === "locked") {
      filtered = filtered.filter((acc) => acc.status === "LOCKED");
    }

    // Filter by provider
    if (filterProvider !== "all") {
      filtered = filtered.filter((acc) => acc.provider === filterProvider);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.name.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "email":
          return a.email.localeCompare(b.email);
        case "provider":
          return (a.provider ?? "Other").localeCompare(b.provider ?? "Other");
        case "unlock": {
          // Locked accounts with soonest unlock first, then available
          if (a.status === "LOCKED" && b.status !== "LOCKED") return -1;
          if (b.status === "LOCKED" && a.status !== "LOCKED") return 1;
          const aT = a.unlock_at ? new Date(a.unlock_at).getTime() : 0;
          const bT = b.unlock_at ? new Date(b.unlock_at).getTime() : 0;
          return aT - bT;
        }
        case "recent":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        case "default":
        default:
          // Available first, then locked by unlock time
          if (a.status !== b.status) {
            return a.status === "AVAILABLE" ? -1 : 1;
          }
          if (a.status === "LOCKED" && b.status === "LOCKED") {
            const aUnlock = a.unlock_at
              ? new Date(a.unlock_at).getTime()
              : 0;
            const bUnlock = b.unlock_at
              ? new Date(b.unlock_at).getTime()
              : 0;
            return aUnlock - bUnlock;
          }
          return 0;
      }
    });

    setFilteredAccounts(filtered);
  }, [accounts, searchQuery, filterStatus, filterProvider, sortBy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "Escape") {
        addModal.close();
        editModal.close();
        lockModal.close();
        deleteModal.close();
        importExportModal.close();
        return;
      }

      if (isTyping) return;

      if (e.key === "/" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]',
        );
        searchInput?.focus();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        addModal.open();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addModal, editModal, lockModal, deleteModal, importExportModal]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Hero Card */}
      <HeroCard accounts={accounts} />

      {/* Stats Row */}
      <StatsRow accounts={accounts} />

      {/* Search and Filter with Add Button */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px" }}>
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            filterProvider={filterProvider}
            onProviderChange={setFilterProvider}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
        <button
          onClick={() => addModal.open()}
          style={{
            height: "38px",
            padding: "0 16px",
            backgroundColor: "#dbfe01",
            color: "#000000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(219, 254, 1, 0.2)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e4ff1a";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(219, 254, 1, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dbfe01";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(219, 254, 1, 0.2)";
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts List */}
      {filteredAccounts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "56px 32px",
            backgroundColor: "#141414",
            border: "1px dashed #2a2a2a",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
            {accounts.length === 0 ? "No accounts yet" : "No accounts match your criteria"}
          </p>
          <p style={{ fontSize: "14px", color: "#a1a1aa", margin: 0 }}>
            {accounts.length === 0
              ? "Add your first account to start tracking AI quotas."
              : "Try adjusting your search terms, status, or provider filter."}
          </p>
          {accounts.length > 0 ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterProvider("all");
              }}
              style={{
                marginTop: "6px",
                padding: "8px 16px",
                backgroundColor: "#222222",
                color: "#ffffff",
                border: "1px solid #333333",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2a2a2a";
                e.currentTarget.style.borderColor = "#444444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#222222";
                e.currentTarget.style.borderColor = "#333333";
              }}
            >
              Clear search & filters
            </button>
          ) : (
            <button
              onClick={() => addModal.open()}
              style={{
                marginTop: "6px",
                padding: "8px 18px",
                backgroundColor: "#dbfe01",
                color: "#000000",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              + Add First Account
            </button>
          )}
        </div>
      ) : (
        <AccountsList
          accounts={filteredAccounts}
          onEdit={(account) => editModal.open(account)}
          onLock={(account) => lockModal.open(account)}
          onDelete={(account) => deleteModal.open(account)}
          onUnlock={handleUnlock}
        />
      )}

      {/* Modals */}
      <AddAccountModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSuccess={() => {
          addModal.close();
          refetch();
        }}
      />
      <EditAccountModal
        isOpen={editModal.isOpen}
        account={editModal.data}
        onClose={editModal.close}
        onSuccess={() => {
          editModal.close();
          refetch();
        }}
      />
      <LockAccountModal
        isOpen={lockModal.isOpen}
        account={lockModal.data}
        onClose={lockModal.close}
        onSuccess={() => {
          lockModal.close();
          refetch();
        }}
      />
      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        account={deleteModal.data}
        onClose={deleteModal.close}
        onSuccess={() => {
          deleteModal.close();
          refetch();
        }}
      />
      <ImportExportModal
        isOpen={importExportModal.isOpen}
        accounts={accounts}
        onClose={importExportModal.close}
        onSuccess={() => {
          importExportModal.close();
          refetch();
        }}
      />
    </div>
  );
}
