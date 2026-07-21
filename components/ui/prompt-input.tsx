"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  maxLength?: number;
  onClear?: () => void;
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (
    { className, error, maxLength, value, onClear, onChange, ...props },
    ref,
  ) => {
    const length = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("relative", className)}>
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={cn(
            "min-h-[120px] max-h-[320px] w-full resize-y rounded-2xl border bg-card/80 p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-disabled backdrop-blur-xl",
            error
              ? "border-error bg-error/[0.04] focus-visible:border-error focus-visible:ring-error/15"
              : "border-border",
          )}
          {...props}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {length > 0 && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-card-elevated hover:text-foreground"
              aria-label="清空提示词"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {maxLength && (
            <span
              className={cn(
                "text-xs tabular-nums",
                length >= maxLength ? "text-error" : "text-muted-foreground",
              )}
            >
              {length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);

PromptInput.displayName = "PromptInput";
