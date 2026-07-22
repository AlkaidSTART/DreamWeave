"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/home-animation-utils";

interface GenerationLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    container: "h-4 gap-1",
    bar: "w-1 h-4",
    text: "text-xs",
  },
  md: {
    container: "h-8 gap-1.5",
    bar: "w-1.5 h-8",
    text: "text-sm",
  },
  lg: {
    container: "h-12 gap-2",
    bar: "w-2 h-12",
    text: "text-base",
  },
};

export function GenerationLoader({
  className,
  label = "生成中",
  size = "md",
}: GenerationLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      barsRef.current.forEach((bar, index) => {
        gsap.to(bar, {
          scaleY: 0.35,
          opacity: 0.4,
          duration: 0.55,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "center bottom",
          delay: index * 0.12,
        });
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  const styles = sizeStyles[size];

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={cn("flex items-end", styles.container)}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            ref={(element) => {
              if (element) {
                barsRef.current[index] = element;
              }
            }}
            className={cn(
              "rounded-full bg-gradient-to-t from-primary to-mint-400",
              styles.bar,
            )}
          />
        ))}
      </div>
      {label && (
        <span className={cn("font-medium text-muted-foreground", styles.text)}>
          {label}
        </span>
      )}
    </div>
  );
}
