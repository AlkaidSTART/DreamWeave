"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GenerationLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  phases?: string[];
  showProgress?: boolean;
  progress?: number;
}

const sizeStyles = {
  sm: { container: "h-16 w-16", text: "text-xs", progress: "text-lg", stroke: 2 },
  md: { container: "h-28 w-28", text: "text-sm", progress: "text-2xl", stroke: 2.5 },
  lg: { container: "h-40 w-40", text: "text-base", progress: "text-4xl", stroke: 3 },
};

const PROGRESS_RADIUS = 48;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PROGRESS_INTERVAL_MS = 400;
const MAX_ESTIMATED_PROGRESS = 85;

function getPhaseIndex(progress: number, phaseCount: number): number {
  if (phaseCount <= 1) return 0;
  return Math.min(phaseCount - 1, Math.floor((progress / 100) * phaseCount));
}

function getDefaultStageLabel(progress: number): string {
  if (progress < 12) return "正在排队";
  if (progress < 28) return "正在解析提示词";
  if (progress < 45) return "正在构思画面";
  if (progress < 62) return "正在生成图像";
  if (progress < 78) return "正在润色细节";
  if (progress < 90) return "正在保存结果";
  return "即将完成";
}

function CoreIndicator({
  size,
  progress,
  showProgress,
}: {
  size: "sm" | "md" | "lg";
  progress: number;
  showProgress: boolean;
}) {
  const styles = sizeStyles[size];
  const roundedProgress = Math.round(Math.min(100, Math.max(0, progress)));
  const offset = PROGRESS_CIRCUMFERENCE - (roundedProgress / 100) * PROGRESS_CIRCUMFERENCE;

  return (
    <div
      className={cn("relative grid place-items-center", styles.container)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={PROGRESS_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={styles.stroke}
          className="text-foreground/10"
        />
        {showProgress && (
          <circle
            cx="50"
            cy="50"
            r={PROGRESS_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={styles.stroke}
            strokeLinecap="round"
            strokeDasharray={PROGRESS_CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="text-foreground transition-[stroke-dashoffset] duration-500 ease-out"
          />
        )}
      </svg>

      <span
        className={cn(
          "font-display font-medium tabular-nums text-foreground",
          styles.progress,
        )}
      >
        {roundedProgress}%
      </span>

      <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-foreground/80">
        <span className="absolute inset-0 h-full w-full animate-ping rounded-full bg-foreground/40" />
      </span>
    </div>
  );
}

export function GenerationLoader({
  className,
  label = "生成中",
  size = "md",
  phases,
  showProgress = false,
  progress: externalProgress,
}: GenerationLoaderProps) {
  const [internalProgress, setInternalProgress] = useState(0);

  const activeProgress =
    typeof externalProgress === "number" ? externalProgress : internalProgress;

  const hasPhases = Boolean(phases?.length);
  const phaseIndex = getPhaseIndex(activeProgress, phases?.length ?? 0);
  const explicitPhase = hasPhases ? phases?.[phaseIndex] ?? label : undefined;
  const currentPhase =
    explicitPhase ?? (showProgress ? getDefaultStageLabel(activeProgress) : label);
  const roundedProgress = Math.round(Math.min(100, Math.max(0, activeProgress)));

  useEffect(() => {
    if (typeof externalProgress === "number") return;
    if (!hasPhases && !showProgress) return;

    const progressTimer = window.setInterval(() => {
      setInternalProgress((current) => {
        if (current >= MAX_ESTIMATED_PROGRESS) return current;
        const remaining = MAX_ESTIMATED_PROGRESS - current;
        const increment = Math.max(0.12, remaining * 0.018);
        return Math.min(MAX_ESTIMATED_PROGRESS, current + increment);
      });
    }, PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(progressTimer);
  }, [externalProgress, hasPhases, showProgress]);

  const accessibleLabel = showProgress
    ? `${currentPhase}，当前进度 ${roundedProgress}%`
    : currentPhase;

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-5", className)}
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
    >
      <CoreIndicator size={size} progress={activeProgress} showProgress={showProgress} />

      {currentPhase && (
        <span className={cn("font-medium text-foreground", sizeStyles[size].text)}>
          {currentPhase}
        </span>
      )}
    </div>
  );
}
