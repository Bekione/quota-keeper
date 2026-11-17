"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Account } from "@/types/account";
import { lockAccount } from "@/lib/services/account-service";
import { IosDateTimePicker } from "@/components/ios-picker/ios-date-time-picker";

interface LockAccountModalProps {
  isOpen: boolean;
  account?: Account;
  defaultLockDuration?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_DAYS = [1, 3, 7, 14, 30];

function dateOffsetDays(days: number): string {
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}

export default function LockAccountModal({
  isOpen,
  account,
  defaultLockDuration = 7,
  onClose,
  onSuccess,
}: LockAccountModalProps) {
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("00:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const isEditMode = account?.status === "LOCKED";

  useEffect(() => {
    if (isOpen && account) {
      setError("");

      if (account.status === "LOCKED" && account.unlock_at) {
        // Pre-fill with existing unlock date/time when editing
        const existingDate = new Date(account.unlock_at);
        setCustomDate(format(existingDate, "yyyy-MM-dd"));
        setCustomTime(format(existingDate, "HH:mm"));
      } else {
        // New lock: default to N days from now at midnight
        setCustomDate(dateOffsetDays(defaultLockDuration));
        setCustomTime("00:00");
      }
    }
  }, [isOpen, account, defaultLockDuration]);

  if (!isOpen || !account) return null;

  const unlockDate =
    customDate && customTime
      ? new Date(`${customDate}T${customTime}`)
      : new Date();

  const isValidDate = !isNaN(unlockDate.getTime()) && unlockDate > new Date();

  async function handleLock() {
    if (!account || !isValidDate) return;
    setError("");
    setLoading(true);

    try {
      const success = await lockAccount(account.id, { unlock_at: unlockDate });
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
          padding: "28px 24px",
          maxWidth: "520px",
          width: "92%",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "4px",
              color: isEditMode ? "#fbbf24" : "#fca5a5",
            }}
          >
            {isEditMode ? "Edit Lock" : "Lock Account"}
          </h2>
          <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0 }}>
            {account.name}
          </p>
        </div>

        {/* Quick preset buttons — only for new locks */}
        {!isEditMode && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#71717a",
                marginBottom: "10px",
              }}
            >
              Quick fill date
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {PRESET_DAYS.map((days) => {
                const isActive = customDate === dateOffsetDays(days);
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setCustomDate(dateOffsetDays(days))}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: isActive ? "#dbfe01" : "#222222",
                      color: isActive ? "#000000" : "#ffffff",
                      border: isActive
                        ? "1px solid #dbfe01"
                        : "1px solid #333333",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {days}d
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date & Time with Embla iOS Wheel Picker */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#71717a",
                margin: 0,
              }}
            >
              {isEditMode ? "Unlock date & time" : "Set exact unlock date & time"}
            </label>
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              style={{
                background: "transparent",
                border: "none",
                color: "#a1a1aa",
                fontSize: "12px",
                cursor: "pointer",
                padding: "2px 6px",
                textDecoration: "underline",
              }}
            >
              {showManualInput ? "Use Wheel Picker" : "Manual text input"}
            </button>
          </div>

          {!showManualInput ? (
            <IosDateTimePicker
              date={customDate}
              time={customTime}
              onChange={(newDate, newTime) => {
                setCustomDate(newDate);
                setCustomTime(newTime);
              }}
            />
          ) : (
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
                  colorScheme: "dark",
                }}
              />
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                style={{
                  width: "130px",
                  padding: "10px 12px",
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #2a2a2a",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  colorScheme: "dark",
                }}
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "#0d0d0d",
            border: `1px solid ${isValidDate ? "#2a2a2a" : "rgba(239,68,68,0.3)"}`,
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          <p style={{ margin: "0 0 2px 0", color: "#71717a" }}>
            Unlock scheduled for:
          </p>
          <p
            style={{
              margin: 0,
              color: isValidDate ? "#dbfe01" : "#fca5a5",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {isValidDate
              ? unlockDate.toLocaleString()
              : "Invalid or past date — please adjust"}
          </p>
        </div>

        {/* Error */}
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

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              height: "40px",
              padding: "0 16px",
              backgroundColor: "#222222",
              color: "#ffffff",
              border: "1px solid #333333",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#222222";
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLock}
            disabled={loading || !isValidDate}
            style={{
              flex: 1,
              height: "40px",
              padding: "0 16px",
              backgroundColor: isEditMode ? "#fbbf24" : "#fca5a5",
              color: isEditMode ? "#78350f" : "#7f1d1d",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: loading || !isValidDate ? "not-allowed" : "pointer",
              opacity: loading || !isValidDate ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {loading ? "Saving..." : isEditMode ? "Update Lock" : "Lock Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
