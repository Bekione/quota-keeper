"use client";

import { useState, useEffect } from "react";
import { Account } from "@/types/account";
import { lockAccount } from "@/lib/services/account-service";
import { addDays } from "date-fns";

interface LockAccountModalProps {
  isOpen: boolean;
  account?: Account;
  defaultLockDuration?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LockAccountModal({
  isOpen,
  account,
  defaultLockDuration = 7,
  onClose,
  onSuccess,
}: LockAccountModalProps) {
  const [duration, setDuration] = useState(defaultLockDuration);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = account?.status === "LOCKED";

  useEffect(() => {
    if (isOpen && account) {
      setError("");

      if (account.status === "LOCKED" && account.unlock_at) {
        // Pre-fill with existing unlock date/time for editing
        const existingDate = new Date(account.unlock_at);
        setCustomDate(existingDate.toISOString().split("T")[0]);
        const hours = existingDate.getHours().toString().padStart(2, "0");
        const minutes = existingDate.getMinutes().toString().padStart(2, "0");
        setCustomTime(`${hours}:${minutes}`);
        setUseCustom(true);
      } else {
        // Default for new lock
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setCustomDate(tomorrow.toISOString().split("T")[0]);
        setCustomTime("00:00");
        setUseCustom(false);
      }
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const unlockDate = useCustom
    ? new Date(`${customDate}T${customTime}`)
    : addDays(new Date(), duration);

  async function handleLock() {
    if (!account) return;
    setError("");
    setLoading(true);

    try {
      const success = await lockAccount(account.id, {
        unlock_at: unlockDate,
      });

      if (success) {
        onSuccess?.();
        onClose();
      } else {
        setError("Failed to lock account");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#171717",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "500px",
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
            color: isEditMode ? "#fbbf24" : "#fca5a5",
          }}
        >
          {isEditMode ? "Edit Lock" : "Lock Account"}
        </h2>
        <p
          style={{
            color: "#a1a1aa",
            fontSize: "14px",
            marginBottom: "24px",
            margin: 0,
          }}
        >
          {account.name}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Duration Options — only show for new locks */}
          {!isEditMode && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                Lock Duration
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {[1, 3, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setDuration(days);
                      setUseCustom(false);
                    }}
                    style={{
                      padding: "10px 8px",
                      backgroundColor:
                        !useCustom && duration === days ? "#dbfe01" : "#2a2a2a",
                      color:
                        !useCustom && duration === days ? "#000000" : "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Date & Time */}
          <div>
            {!isEditMode && (
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Custom Date & Time
              </label>
            )}
            {isEditMode && (
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px",
                }}
              >
                Unlock Date & Time
              </label>
            )}
            {(useCustom || isEditMode) && (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    backgroundColor: "#0d0d0d",
                    border: "1px solid #2a2a2a",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  style={{
                    width: "140px",
                    padding: "10px 12px",
                    backgroundColor: "#0d0d0d",
                    border: "1px solid #2a2a2a",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>

          {/* Preview */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "#0d0d0d",
              border: "1px solid #2a2a2a",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#a1a1aa",
            }}
          >
            <p style={{ margin: "0 0 4px 0" }}>Unlock Date:</p>
            <p style={{ margin: 0, color: "#dbfe01", fontWeight: 600 }}>
              {unlockDate.toLocaleString()}
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                color: "#fca5a5",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "#2a2a2a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLock}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: isEditMode ? "#fbbf24" : "#fca5a5",
                color: isEditMode ? "#78350f" : "#7f1d1d",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Lock"
                  : "Lock Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
