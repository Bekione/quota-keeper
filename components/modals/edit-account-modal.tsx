"use client";

import { useState, useEffect } from "react";
import { Account, PROVIDERS, PROVIDER_COLORS, AccountProvider } from "@/types/account";
import { updateAccount } from "@/lib/services/account-service";
import CustomSelect from "@/components/ui/custom-select";

interface EditAccountModalProps {
  isOpen: boolean;
  account?: Account;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditAccountModal({
  isOpen,
  account,
  onClose,
  onSuccess,
}: EditAccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    chrome_profile: "",
    provider: "" as string,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account && isOpen) {
      setFormData({
        name: account.name,
        email: account.email,
        chrome_profile: account.chrome_profile || "",
        provider: account.provider || "",
        notes: account.notes || "",
      });
      setError("");
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!account) return;
      const success = await updateAccount(account.id, {
        name: formData.name,
        email: formData.email,
        chrome_profile: formData.chrome_profile || undefined,
        provider: (formData.provider || undefined) as
          | AccountProvider
          | undefined,
        notes: formData.notes || undefined,
      });

      if (success) {
        onSuccess?.();
        onClose();
      } else {
        setError("Failed to update account");
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
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#dbfe01",
          }}
        >
          Edit Account
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#0d0d0d",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#0d0d0d",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Chrome Profile
            </label>
            <input
              type="text"
              value={formData.chrome_profile}
              onChange={(e) =>
                setFormData({ ...formData, chrome_profile: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#0d0d0d",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Provider
            </label>
            <CustomSelect
              value={formData.provider}
              onChange={(val) =>
                setFormData({ ...formData, provider: val })
              }
              options={[
                { value: "", label: "Select provider (optional)" },
                ...PROVIDERS.map((p) => ({
                  value: p,
                  label: p,
                  color: PROVIDER_COLORS[p],
                })),
              ]}
              fullWidth
              placeholder="Select provider (optional)"
              triggerStyle={{
                backgroundColor: "#0d0d0d",
                height: "40px",
              }}
              ariaLabel="Select provider"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#0d0d0d",
                border: "1px solid #2a2a2a",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                minHeight: "100px",
                maxHeight: "200px",
                fontFamily: "inherit",
              }}
            />
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

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
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
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                height: "40px",
                padding: "0 16px",
                backgroundColor: "#dbfe01",
                color: "#000000",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
