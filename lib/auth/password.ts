"use client";

import { setSession } from "./session";

export async function loginWithPassword(password: string): Promise<boolean> {
  try {
    // Call server-side login endpoint to verify password
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    console.log("[QuotaKeeper] API response:", data);

    if (data.success) {
      console.log("[QuotaKeeper] Setting session...");
      // Set session
      await setSession({
        authenticated: true,
        lastLogin: new Date(),
      });
      console.log("[QuotaKeeper] Session set");
      return true;
    }

    console.log("[QuotaKeeper] Login failed, success was:", data.success);
    return false;
  } catch (error) {
    console.error("[QuotaKeeper] Login error:", error);
    return false;
  }
}

export async function logout(): Promise<void> {
  // Clear session will be handled by client-side code
  await fetch("/api/auth/logout", { method: "POST" });
}
