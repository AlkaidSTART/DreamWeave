"use client";

import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore, type ToastType } from "@/stores/toast-store";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: "border-l-mint-500 text-mint-500",
  error: "border-l-error text-error",
  info: "border-l-primary text-primary",
};

export function Toast({ id, type, title, message }: ToastProps) {
  const Icon = icons[type];

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-xl",
        "border-l-4",
        styles[type],
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {message && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => useToastStore.getState().removeToast(id)}
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-card-elevated hover:text-foreground"
        aria-label="关闭提示"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
