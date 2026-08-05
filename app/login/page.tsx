"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-redirect if already authenticated (enables offline PWA access)
  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("quotakeeper_auth_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.authenticated) {
          router.replace("/");
          return;
        }
      }
    } catch {}
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Read password directly from DOM input
      const password = inputRef.current?.value || "";

      if (!password) {
        setError("Please enter a password");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        const session = {
          authenticated: true,
          lastLogin: new Date().toISOString(),
        };
        localStorage.setItem(
          "quotakeeper_auth_session",
          JSON.stringify(session),
        );
        router.push("/");
      } else {
        setError("Invalid password");
        setLoading(false);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d0d0d",
        color: "#ffffff",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          backgroundColor: "#171717",
          borderRadius: "12px",
          border: "1px solid #2a2a2a",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          QuotaKeeper
        </h1>
        <p
          style={{
            color: "#a1a1aa",
            textAlign: "center",
            marginBottom: "32px",
            fontSize: "14px",
          }}
        >
          AI Account Quota Manager
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#e4e4e7",
              }}
            >
              Password
            </label>
            <input
              ref={inputRef}
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="off"
              style={{
                width: "100%",
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

          <button
            type="submit"
            style={{
              padding: "10px 16px",
              backgroundColor: "#dbfe01",
              color: "#000000",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
