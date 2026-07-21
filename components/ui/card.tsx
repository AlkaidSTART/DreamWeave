import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 ease-smooth",
          "backdrop-blur-xl",
          variant === "elevated" && "bg-card-elevated",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
