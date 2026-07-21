"use client";

import { cn } from "@/lib/utils";

interface CountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  label?: string;
}

export function CountSelector({
  value,
  onChange,
  options = [1, 2, 3, 4],
  label = "生成数量",
}: CountSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="inline-flex rounded-[10px] border border-border bg-card p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "h-8 min-w-[40px] rounded-lg px-3 text-sm font-semibold transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              value === option
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card-elevated hover:text-foreground",
            )}
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
