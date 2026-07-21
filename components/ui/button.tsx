import {
  forwardRef,
  isValidElement,
  cloneElement,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "upgrade" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg active:bg-primary-active active:translate-y-0",
  secondary:
    "border border-border bg-transparent text-foreground hover:bg-card-elevated hover:border-border-accent active:bg-card-elevated",
  upgrade:
    "bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:-translate-y-0.5 active:bg-amber-600 active:translate-y-0",
  ghost:
    "bg-transparent text-foreground hover:bg-card-elevated active:bg-card-elevated",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-[52px] px-6 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-disabled disabled:text-muted-foreground";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      baseClasses,
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    const content = isLoading ? (
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-current" />
        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-current [animation-delay:0.2s]" />
        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-current [animation-delay:0.4s]" />
      </span>
    ) : (
      <>
        {leftIcon}
        {children}
        {rightIcon}
      </>
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
        ...props,
        children: (
          <>
            {leftIcon}
            {child.props.children}
            {rightIcon}
          </>
        ),
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
