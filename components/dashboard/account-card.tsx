"use client";

import { Account } from "@/types/account";
import { useCountdown, formatCountdown } from "@/hooks/useCountdown";

interface AccountCardProps {
  account: Account;
  onEdit?: () => void;
  onDelete?: () => void;
  onLock?: () => void;
}

export default function AccountCard({
  account,
  onEdit,
  onDelete,
  onLock,
}: AccountCardProps) {
  const countdown = useCountdown(account.unlock_at);

  const getStatusColor = (status: string) => {
    if (status === "AVAILABLE") return "#86efac";
    return "#fca5a5";
  };

  const getStatusLabel = (status: string) => {
    return status === "AVAILABLE" ? "✓ Available" : "⏱ Locked";
  };

  return (
    <div
      style={{
        backgroundColor: "#171717",
        border: "1px solid #2a2a2a",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              margin: "0 0 4px 0",
              color: "#ffffff",
            }}
          >
            {account.name}
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "#a1a1aa",
              margin: 0,
            }}
          >
            {account.email}
          </p>
        </div>

        {/* Status Badge */}
        <div
          style={{
            padding: "6px 12px",
            backgroundColor:
              account.status === "AVAILABLE"
                ? "rgba(134, 239, 172, 0.1)"
                : "rgba(252, 165, 165, 0.1)",
            border: `1px solid ${
              account.status === "AVAILABLE"
                ? "rgba(134, 239, 172, 0.3)"
                : "rgba(252, 165, 165, 0.3)"
            }`,
            borderRadius: "4px",
            color: getStatusColor(account.status),
            fontSize: "12px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {getStatusLabel(account.status)}
        </div>
      </div>

      {/* Chrome Profile */}
      {account.chrome_profile && (
        <p
          style={{
            fontSize: "12px",
            color: "#a1a1aa",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Profile: {account.chrome_profile}
        </p>
      )}

      {/* Countdown or Locked Date */}
      {account.status === "LOCKED" && account.unlock_at && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "rgba(252, 165, 165, 0.05)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#fca5a5",
          }}
        >
          Available in {formatCountdown(countdown)}
          <br />
          <span style={{ fontSize: "11px", color: "#a1a1aa" }}>
            {new Date(account.unlock_at).toLocaleString()}
          </span>
        </div>
      )}

      {/* Notes */}
      {account.notes && (
        <p
          style={{
            fontSize: "12px",
            color: "#71717a",
            margin: 0,
            fontStyle: "italic",
            borderLeft: "2px solid #2a2a2a",
            paddingLeft: "8px",
          }}
        >
          {account.notes}
        </p>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "8px",
          paddingTop: "12px",
          borderTop: "1px solid #2a2a2a",
        }}
      >
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              padding: "8px 12px",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#3a3a3a";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#2a2a2a";
            }}
          >
            Edit
          </button>
        )}
        {onLock && (
          <button
            onClick={onLock}
            style={{
              flex: 1,
              padding: "8px 12px",
              backgroundColor:
                account.status === "LOCKED" ? "#fbbf24" : "#fca5a5",
              color: account.status === "LOCKED" ? "#78350f" : "#7f1d1d",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {account.status === "LOCKED" ? "Edit Lock" : "Lock"}
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              flex: 1,
              padding: "8px 12px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                "rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor =
                "rgba(239, 68, 68, 0.1)";
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
