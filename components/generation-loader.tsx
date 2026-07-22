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
    container: "w-24 h-16",
    text: "text-xs",
    orb: "scale-75",
  },
  md: {
    container: "w-40 h-28",
    text: "text-sm",
    orb: "scale-100",
  },
  lg: {
    container: "w-56 h-40",
    text: "text-base",
    orb: "scale-125",
  },
};

export function GenerationLoader({
  className,
  label = "生成中",
  size = "md",
}: GenerationLoaderProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!orbRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(orbRef.current, {
        rotate: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
      });

      if (shimmerRef.current) {
        gsap.fromTo(
          shimmerRef.current,
          { x: "-100%", opacity: 0 },
          {
            x: "100%",
            opacity: 0.6,
            duration: 2.4,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 0.8,
          },
        );
      }

      if (textRef.current) {
        gsap.to(textRef.current, {
          opacity: 0.55,
          duration: 1.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, orbRef.current);

    return () => ctx.revert();
  }, []);

  const styles = sizeStyles[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[22px] bg-muted/10 shadow-inner",
          styles.container,
        )}
      >
        <div
          ref={orbRef}
          className={cn(
            "absolute inset-[-50%] m-auto aspect-square w-[140%] rounded-full",
            "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(99,102,241,0.22)_60deg,transparent_120deg,rgba(20,184,166,0.18)_180deg,transparent_240deg,rgba(99,102,241,0.22)_300deg,transparent_360deg)]",
            "blur-2xl",
            styles.orb,
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-mint-400/5" />
        <div
          ref={shimmerRef}
          className="absolute inset-0 w-full -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent"
        />
        <div className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/10 dark:ring-white/8" />
      </div>

      {label && (
        <span
          ref={textRef}
          className={cn("font-medium text-muted-foreground", styles.text)}
        >
          {label}
        </span>
      )}
    </div>
  );
}
