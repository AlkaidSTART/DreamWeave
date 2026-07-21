import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  min?: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function Progress({
  value,
  min = 0,
  max = 100,
  className,
  showLabel = true,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-elevated">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>生成进度</span>
          <span className="tabular-nums">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
