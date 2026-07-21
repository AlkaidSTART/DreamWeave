import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-1 w-1 gap-1",
  md: "h-1.5 w-1.5 gap-1.5",
  lg: "h-2 w-2 gap-2",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label="加载中"
      role="status"
    >
      <span
        className={cn(
          "animate-breathe rounded-full bg-current",
          sizeClasses[size],
        )}
      />
      <span
        className={cn(
          "animate-breathe rounded-full bg-current [animation-delay:0.2s]",
          sizeClasses[size],
        )}
      />
      <span
        className={cn(
          "animate-breathe rounded-full bg-current [animation-delay:0.4s]",
          sizeClasses[size],
        )}
      />
    </span>
  );
}
