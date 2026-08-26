"use client";

import { ArrowUpDown } from "lucide-react";
import { PROVIDERS, AccountProvider } from "@/types/account";

export type SortOption =
  | "default"
  | "name"
  | "email"
  | "provider"
  | "unlock"
  | "recent";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  name: "Name (A–Z)",
  email: "Email (A–Z)",
  provider: "Provider",
  unlock: "Unlock Time",
  recent: "Recently Added",
};

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: "all" | "available" | "locked";
  onFilterChange: (status: "all" | "available" | "locked") => void;
  filterProvider?: AccountProvider | "all";
  onProviderChange?: (provider: AccountProvider | "all") => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  filterProvider = "all",
  onProviderChange,
  sortBy = "default",
  onSortChange,
}: SearchFilterProps) {
  const filterOptions: Array<{
    value: "all" | "available" | "locked";
    label: string;
  }> = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "locked", label: "Locked" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="Search by name or email... (press / to focus)"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          flex: 1,
          minWidth: "250px",
          padding: "10px 16px",
          backgroundColor: "#171717",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
          color: "#ffffff",
          fontSize: "14px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            style={{
              padding: "8px 16px",
              backgroundColor:
                filterStatus === option.value ? "#dbfe01" : "#2a2a2a",
              color: filterStatus === option.value ? "#000000" : "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (filterStatus !== option.value) {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#3a3a3a";
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== option.value) {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#2a2a2a";
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Provider Filter */}
      {onProviderChange && (
        <select
          value={filterProvider}
          onChange={(e) =>
            onProviderChange(e.target.value as AccountProvider | "all")
          }
          style={{
            padding: "8px 12px",
            backgroundColor: "#2a2a2a",
            color: "#ffffff",
            border: "1px solid #3a3a3a",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All Providers</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      {onSortChange && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ArrowUpDown size={14} style={{ color: "#71717a", flexShrink: 0 }} />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              border: "1px solid #3a3a3a",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
