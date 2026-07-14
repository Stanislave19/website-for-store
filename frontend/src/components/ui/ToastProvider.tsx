"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface ToastOptions {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

interface ToastData extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ id: Date.now(), ...options });
    timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {toast ? (
          <div
            key={toast.id}
            className="animate-toast-in pointer-events-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-start gap-2 rounded-[3px] bg-racing px-5 py-4 text-cream shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:w-auto sm:max-w-xl sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="font-sans text-sm sm:whitespace-nowrap">{toast.message}</span>
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start">
              {toast.actionHref ? (
                <Link
                  href={toast.actionHref}
                  onClick={dismiss}
                  className="shrink-0 font-sans text-sm font-medium whitespace-nowrap text-brass underline underline-offset-4"
                >
                  {toast.actionLabel}
                </Link>
              ) : null}
              <button
                type="button"
                aria-label="Закрити"
                onClick={dismiss}
                className="shrink-0 text-cream/70 hover:text-cream"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast має використовуватись усередині ToastProvider");
  return ctx;
}
