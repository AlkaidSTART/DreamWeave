import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-[10px] border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted-foreground",
          error
            ? "border-error bg-error/[0.04] focus-visible:border-error focus-visible:ring-error/15"
            : "border-border",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
