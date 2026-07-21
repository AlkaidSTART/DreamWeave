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
    "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:bg-primary-active active:translate-y-0",
  secondary:
    "border border-white/30 bg-white/40 text-foreground shadow-sm backdrop-blur-md hover:bg-white/60 hover:border-white/50 hover:shadow-md active:bg-white/50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
  upgrade:
    "bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:-translate-y-0.5 active:bg-amber-600 active:translate-y-0",
  ghost:
    "bg-transparent text-foreground hover:bg-white/40 hover:backdrop-blur-sm active:bg-white/30 dark:hover:bg-white/5",
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
