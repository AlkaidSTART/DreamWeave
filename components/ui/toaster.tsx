"use client";

import { useSyncExternalStore } from "react";
import { Toast } from "@/components/ui/toast";
import { subscribe, getToasts } from "@/lib/toast-store";

const serverSnapshot: never[] = [];

export function Toaster() {
  const toasts = useSyncExternalStore(
    subscribe,
    getToasts,
    () => serverSnapshot,
  );

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed right-4 top-4 z-50 flex flex-col gap-3 md:right-6 md:top-6"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
