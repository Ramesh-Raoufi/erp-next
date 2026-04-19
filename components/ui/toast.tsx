"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type ToastVariant = "info" | "success" | "error";

type ToastOptions = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir(i18n.language) === "rtl";

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = createToastId();
      const item: ToastItem = {
        id,
        variant: "info",
        duration: 4000,
        ...options,
      };
      setToasts((prev) => [...prev, item]);
      const timeout = window.setTimeout(() => removeToast(id), item.duration);
      return () => window.clearTimeout(timeout);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={cn(
          "fixed inset-x-4 bottom-4 z-[60] flex max-h-[70vh] flex-col gap-2 overflow-hidden sm:inset-auto sm:bottom-6 sm:w-[360px]",
          isRtl ? "sm:left-6 sm:right-auto" : "sm:right-6 sm:left-auto",
        )}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto w-full rounded-lg border px-4 py-3 shadow-lg",
              item.variant === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              item.variant === "error" &&
                "border-red-200 bg-red-50 text-red-900",
              item.variant === "info" && "border-blue-200 bg-blue-50 text-blue-900",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                {item.title ? (
                  <div className="text-sm font-semibold">{item.title}</div>
                ) : null}
                <div className="text-sm">{item.message}</div>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 text-current/70 transition-colors hover:text-current"
                onClick={() => removeToast(item.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
