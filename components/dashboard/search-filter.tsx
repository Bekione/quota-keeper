"use client";

import { useRef } from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import { PROVIDERS, PROVIDER_COLORS, AccountProvider } from "@/types/account";
import CustomSelect, { SelectOption } from "@/components/ui/custom-select";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const filterOptions: Array<{
    value: "all" | "available" | "locked";
    label: string;
  }> = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "locked", label: "Locked" },
  ];

  const providerOptions: SelectOption[] = [
    { value: "all", label: "All Providers" },
    ...PROVIDERS.map((p) => ({
      value: p,
      label: p,
      color: PROVIDER_COLORS[p],
    })),
  ];

  const sortOptions: SelectOption[] = (
    Object.keys(SORT_LABELS) as SortOption[]
  ).map((key) => ({
    value: key,
    label: SORT_LABELS[key],
  }));

  const handleClearSearch = () => {
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Search Input with Search Icon and Clear Button */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minWidth: "260px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            color: "#71717a",
            pointerEvents: "none",
            flexShrink: 0,
          }}
        />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search accounts or emails..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              if (searchQuery) {
                e.stopPropagation();
                handleClearSearch();
              } else {
                inputRef.current?.blur();
              }
            }
          }}
          style={{
            width: "100%",
            height: "38px",
            padding: "8px 36px 8px 36px",
            backgroundColor: "#171717",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "14px",
            outline: "none",
            transition:
              "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#dbfe01";
            e.currentTarget.style.boxShadow =
              "0 0 0 2px rgba(219, 254, 1, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#2a2a2a";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {/* Clear Button or Keyboard Shortcut Badge */}
        {searchQuery ? (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search input"
            title="Clear search (Esc)"
            style={{
              position: "absolute",
              right: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "#2a2a2a",
              color: "#a1a1aa",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3a3a3a";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2a2a2a";
              e.currentTarget.style.color = "#a1a1aa";
            }}
          >
            <X size={13} />
          </button>
        ) : (
          <kbd
            style={{
              position: "absolute",
              right: "10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#71717a",
              backgroundColor: "#222222",
              border: "1px solid #333333",
              borderRadius: "4px",
              padding: "2px 6px",
              pointerEvents: "none",
              lineHeight: 1,
            }}
            title="Press / to focus search"
          >
            /
          </kbd>
        )}
      </div>

      {/* Status Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            style={{
              height: "38px",
              padding: "0 14px",
              backgroundColor:
                filterStatus === option.value ? "#dbfe01" : "#171717",
              color: filterStatus === option.value ? "#000000" : "#ffffff",
              border: `1px solid ${
                filterStatus === option.value ? "#dbfe01" : "#2a2a2a"
              }`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (filterStatus !== option.value) {
                e.currentTarget.style.backgroundColor = "#222222";
                e.currentTarget.style.borderColor = "#3a3a3a";
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== option.value) {
                e.currentTarget.style.backgroundColor = "#171717";
                e.currentTarget.style.borderColor = "#2a2a2a";
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Provider Custom Select */}
      {onProviderChange && (
        <CustomSelect
          value={filterProvider}
          onChange={(val) =>
            onProviderChange(val as AccountProvider | "all")
          }
          options={providerOptions}
          ariaLabel="Filter by provider"
        />
      )}

      {/* Sort Custom Select */}
      {onSortChange && (
        <CustomSelect
          value={sortBy}
          onChange={(val) => onSortChange(val as SortOption)}
          options={sortOptions}
          icon={<ArrowUpDown size={14} style={{ color: "#a1a1aa" }} />}
          ariaLabel="Sort accounts"
        />
      )}
    </div>
  );
}
