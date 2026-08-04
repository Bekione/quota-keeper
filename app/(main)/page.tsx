"use client";

import { useState, useEffect } from "react";
import HeroCard from "@/components/dashboard/hero-card";
import AccountsList from "@/components/dashboard/accounts-list";
import SearchFilter from "@/components/dashboard/search-filter";
import StatsRow from "@/components/dashboard/stats-row";
import AddAccountModal from "@/components/modals/add-account-modal";
import EditAccountModal from "@/components/modals/edit-account-modal";
import LockAccountModal from "@/components/modals/lock-account-modal";
import DeleteConfirmation from "@/components/modals/delete-confirmation";
import ImportExportModal from "@/components/modals/import-export-modal";
import { useAccounts } from "@/hooks/useAccounts";
import { useModal } from "@/hooks/useModal";
import { Account } from "@/types/account";

export default function Dashboard() {
  const { accounts, loading, refetch } = useAccounts();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "locked"
  >("all");
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

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

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.name.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query),
      );
    }

    // Sort: Available first, then locked by unlock time
    filtered.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "AVAILABLE" ? -1 : 1;
      }
      if (a.status === "LOCKED" && b.status === "LOCKED") {
        const aUnlock = a.unlock_at?.getTime() ?? 0;
        const bUnlock = b.unlock_at?.getTime() ?? 0;
        return aUnlock - bUnlock;
      }
      return 0;
    });

    setFilteredAccounts(filtered);
  }, [accounts, searchQuery, filterStatus]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          color: "#a1a1aa",
        }}
      >
        Loading your accounts...
      </div>
    );
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
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "250px" }}>
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </div>
        <button
          onClick={() => addModal.open()}
          style={{
            padding: "10px 16px",
            backgroundColor: "#dbfe01",
            color: "#000000",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.opacity = "1";
          }}
        >
          + Add Account
        </button>
      </div>

      {/* Accounts List */}
      {filteredAccounts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            color: "#71717a",
          }}
        >
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            No accounts found
          </p>
          <p style={{ fontSize: "14px" }}>
            {accounts.length === 0
              ? "Add your first account to get started"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      ) : (
        <AccountsList
          accounts={filteredAccounts}
          onEdit={(account) => editModal.open(account)}
          onLock={(account) => lockModal.open(account)}
          onDelete={(account) => deleteModal.open(account)}
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
