"use client";

import { cn } from "@/lib/utils";
import { QUALITY_OPTIONS, type ImageQuality } from "@/lib/image-config";

interface QualitySelectorProps {
  value: ImageQuality;
  onChange: (value: ImageQuality) => void;
  className?: string;
}

export function QualitySelector({ value, onChange, className }: QualitySelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium text-foreground">清晰度</span>
      <div className="grid grid-cols-4 gap-2">
        {QUALITY_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 text-xs transition-all",
                active
                  ? "border-primary/30 bg-primary/10 text-primary shadow-[0_2px_12px_rgba(99,102,241,0.14)]"
                  : "border-border bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-foreground",
              )}
              title={option.description}
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-[10px] opacity-80">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
