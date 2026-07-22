"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/home-animation-utils";

gsap.registerPlugin(useGSAP);

interface GenerationLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  phases?: string[];
  showProgress?: boolean;
}

const sizeStyles = {
  sm: { container: "h-20 w-20", text: "text-xs", progress: "text-lg" },
  md: { container: "h-36 w-36", text: "text-sm", progress: "text-2xl" },
  lg: { container: "h-52 w-52", text: "text-base", progress: "text-3xl" },
};

const PROGRESS_RADIUS = 74;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PROGRESS_INTERVAL_MS = 200;
const MAX_ESTIMATED_PROGRESS = 95;

function getPhaseIndex(progress: number, phaseCount: number): number {
  if (phaseCount <= 1) return 0;
  return Math.min(
    phaseCount - 1,
    Math.floor((progress / (MAX_ESTIMATED_PROGRESS + 1)) * phaseCount),
  );
}

export function GenerationLoader({
  className,
  label = "生成中",
  size = "md",
  phases,
  showProgress = false,
}: GenerationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGGElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

  const hasPhases = Boolean(phases?.length);
  const phaseIndex = getPhaseIndex(progress, phases?.length ?? 0);
  const currentPhase = hasPhases ? phases?.[phaseIndex] ?? label : label;
  const roundedProgress = Math.round(progress);

  useEffect(() => {
    if (!hasPhases && !showProgress) return;

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= MAX_ESTIMATED_PROGRESS) return current;
        const remaining = 100 - current;
        return Math.min(
          MAX_ESTIMATED_PROGRESS,
          current + Math.max(0.25, remaining * 0.035),
        );
      });
    }, PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(progressTimer);
  }, [hasPhases, showProgress]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      timeline
        .fromTo(
          containerRef.current,
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.6 },
        )
        .fromTo(
          coreRef.current,
          { scale: 0.72 },
          { scale: 1, duration: 0.7 },
          "<0.05",
        );

      gsap.to(orbitRef.current, {
        rotation: 360,
        svgOrigin: "100 100",
        duration: 18,
        ease: "none",
        repeat: -1,
      });

      gsap.to(coreRef.current, {
        scale: 1.08,
        opacity: 0.82,
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      if (!phaseRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        phaseRef.current,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    },
    {
      scope: containerRef,
      dependencies: [currentPhase],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (!progressRef.current) return;

    const offset =
      PROGRESS_CIRCUMFERENCE -
      (progress / 100) * PROGRESS_CIRCUMFERENCE;
    const tween = gsap.to(progressRef.current, {
      attr: { strokeDashoffset: offset },
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.out",
    });

    return () => {
      tween.kill();
    };
  }, [progress]);

  const styles = sizeStyles[size];
  const accessibleLabel = showProgress
    ? `${currentPhase}，当前进度 ${roundedProgress}%`
    : currentPhase;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col items-center justify-center gap-5", className)}
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
    >
      <div className={cn("relative grid place-items-center", styles.container)}>
        <div className="absolute inset-[18%] rounded-full bg-primary/10 blur-2xl" />
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r={PROGRESS_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/10"
          />
          {showProgress && (
            <circle
              ref={progressRef}
              cx="100"
              cy="100"
              r={PROGRESS_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={PROGRESS_CIRCUMFERENCE}
              className="text-primary"
              transform="rotate(-90 100 100)"
            />
          )}
          <g ref={orbitRef} className="will-change-transform">
            <circle
              cx="100"
              cy="100"
              r="91"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 8"
              className="text-foreground/12"
            />
            <circle cx="191" cy="100" r="3" className="fill-mint-400" />
          </g>
        </svg>

        <div
          ref={coreRef}
          className="relative grid aspect-square h-[30%] place-items-center rounded-full border border-white/40 bg-primary shadow-[0_8px_28px_rgba(99,102,241,0.24)] will-change-transform"
        >
          <div className="h-2 w-2 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
        </div>

        {showProgress && (
          <span
            className={cn(
              "absolute bottom-[17%] font-display font-semibold tabular-nums text-foreground",
              styles.progress,
            )}
          >
            {roundedProgress}%
          </span>
        )}
      </div>

      {currentPhase && (
        <span
          ref={phaseRef}
          className={cn("font-medium text-foreground will-change-transform", styles.text)}
        >
          {currentPhase}
        </span>
      )}
    </div>
  );
}
