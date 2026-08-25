"use client";

import { useState } from "react";
import { Copy, Check, Lock, LockOpen, Globe } from "lucide-react";
import { Account, PROVIDER_COLORS, AccountProvider } from "@/types/account";
import { useCountdown, formatCountdown } from "@/hooks/useCountdown";
import { unlockAccount } from "@/lib/services/account-service";

interface AccountCardProps {
  account: Account;
  onEdit?: () => void;
  onDelete?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
}

export default function AccountCard({
  account,
  onEdit,
  onDelete,
  onLock,
  onUnlock,
}: AccountCardProps) {
  const countdown = useCountdown(account.unlock_at);
  const [copied, setCopied] = useState(false);

  const getStatusColor = (status: string) => {
    if (status === "AVAILABLE") return "#86efac";
    return "#fca5a5";
  };

  const getStatusLabel = (status: string) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {status === "AVAILABLE" ? <LockOpen size={10} /> : <Lock size={10} />}
      {status === "AVAILABLE" ? "Available" : "Locked"}
    </span>
  );

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(account.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = account.email;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const providerColor = account.provider
    ? PROVIDER_COLORS[account.provider as AccountProvider] || "#a1a1aa"
    : null;

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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "0",
                color: "#ffffff",
              }}
            >
              {account.name}
            </h3>
            {/* Provider Badge */}
            {account.provider && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "99px",
                  backgroundColor: `${providerColor}15`,
                  color: providerColor || "#a1a1aa",
                  border: `1px solid ${providerColor}40`,
                  whiteSpace: "nowrap",
                }}
              >
                {account.provider}
              </span>
            )}
          </div>
          {/* Email with copy button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "4px",
            }}
          >
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
              {account.email}
            </p>
            <button
              onClick={handleCopyEmail}
              title="Copy email"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                color: copied ? "#86efac" : "#71717a",
                transition: "color 0.2s",
                flexShrink: 0,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
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
            flexShrink: 0,
            marginLeft: "8px",
          }}
        >
          {getStatusLabel(account.status)}
        </div>
      </div>

      {/* Chrome Profile */}
      {account.chrome_profile && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe size={11} style={{ color: "#71717a", flexShrink: 0 }} />
          <p
            style={{
              fontSize: "12px",
              color: "#a1a1aa",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {account.chrome_profile}
          </p>
        </div>
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
        {/* Lock / Unlock Now / Edit Lock */}
        {account.status === "AVAILABLE" && onLock && (
          <button
            onClick={onLock}
            style={{
              flex: 1,
              padding: "8px 12px",
              backgroundColor: "#fca5a5",
              color: "#7f1d1d",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Lock
          </button>
        )}
        {account.status === "LOCKED" && (
          <>
            {onUnlock && (
              <button
                onClick={onUnlock}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "#86efac",
                  color: "#14532d",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Unlock Now
              </button>
            )}
            {onLock && (
              <button
                onClick={onLock}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "#fbbf24",
                  color: "#78350f",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Edit Lock
              </button>
            )}
          </>
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
