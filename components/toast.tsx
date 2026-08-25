"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op version when used outside provider (e.g. in services)
    return {
      toasts: [] as Toast[],
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
}

// Global toast function for use outside React components (e.g. sync-manager)
let globalAddToast: ((toast: Omit<Toast, "id">) => void) | null = null;

export function showToast(toast: Omit<Toast, "id">): void {
  if (globalAddToast) {
    globalAddToast(toast);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5

      const duration = toast.duration ?? (toast.type === "error" ? 8000 : 4000);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  // Register global function
  globalAddToast = addToast;

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast colors
const TOAST_STYLES: Record<
  ToastType,
  { bg: string; border: string; color: string; icon: string }
> = {
  success: {
    bg: "rgba(134, 239, 172, 0.1)",
    border: "rgba(134, 239, 172, 0.3)",
    color: "#86efac",
    icon: "✓",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    icon: "✕",
  },
  warning: {
    bg: "rgba(251, 191, 36, 0.1)",
    border: "rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    icon: "⚠",
  },
  info: {
    bg: "rgba(147, 197, 253, 0.1)",
    border: "rgba(147, 197, 253, 0.3)",
    color: "#93c5fd",
    icon: "ℹ",
  },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 9999,
        maxWidth: "400px",
      }}
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            style={{
              padding: "12px 16px",
              backgroundColor: "#1a1a1a",
              border: `1px solid ${style.border}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "slideInRight 0.3s ease-out",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <span
              style={{ color: style.color, fontSize: "16px", flexShrink: 0 }}
            >
              {style.icon}
            </span>
            <span style={{ color: "#e4e4e7", fontSize: "13px", flex: 1 }}>
              {toast.message}
            </span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick();
                  onDismiss(toast.id);
                }}
                style={{
                  padding: "4px 10px",
                  backgroundColor: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: "4px",
                  color: style.color,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
