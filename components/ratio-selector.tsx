"use client";

import { cn } from "@/lib/utils";
import { RATIO_OPTIONS, type ImageRatio } from "@/lib/image-config";

interface RatioSelectorProps {
  value: ImageRatio;
  onChange: (value: ImageRatio) => void;
  className?: string;
}

export function RatioSelector({ value, onChange, className }: RatioSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium text-foreground">画面比例</span>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {RATIO_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs transition-all",
                active
                  ? "border-primary/30 bg-primary/10 text-primary shadow-[0_2px_12px_rgba(99,102,241,0.14)]"
                  : "border-border bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-foreground",
              )}
              title={option.description}
            >
              <span className="font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
