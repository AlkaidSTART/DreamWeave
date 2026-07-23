"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/home-animation-utils";

gsap.registerPlugin(useGSAP);

interface GenerationLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  phases?: string[];
  showProgress?: boolean;
  tips?: string[];
  fullscreen?: boolean;
}

const sizeStyles = {
  sm: { container: "h-20 w-20", text: "text-xs", progress: "text-lg" },
  md: { container: "h-36 w-36", text: "text-sm", progress: "text-2xl" },
  lg: { container: "h-52 w-52", text: "text-base", progress: "text-3xl" },
};

const PROGRESS_RADIUS = 74;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PROGRESS_INTERVAL_MS = 400;
const MAX_ESTIMATED_PROGRESS = 85;

const DEFAULT_TIPS = [
  "用具体名词开头，比如『一只橘猫』而不是『一只猫』",
  "加上光线描述：柔和阳光、霓虹灯光、晨光...",
  "用风格词定调：赛博朋克、水彩、像素艺术...",
  "用构图词引导：特写、全景、低角度...",
  "用质量词收尾：8k、超高清、细节丰富...",
  "想换脸或改风格？图生图只描述变化部分",
  "避免否定句，多用正向描述",
  "用逗号分隔关键词，画面更可控",
];

function getPhaseIndex(progress: number, phaseCount: number): number {
  if (phaseCount <= 1) return 0;
  return Math.min(
    phaseCount - 1,
    Math.floor((progress / 100) * phaseCount),
  );
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
  const orbitRef = useRef<SVGGElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const roundedProgress = Math.round(progress);
  const styles = sizeStyles[size];

  useEffect(() => {
    if (!progressRef.current) return;

    const offset =
      PROGRESS_CIRCUMFERENCE - (progress / 100) * PROGRESS_CIRCUMFERENCE;
    const tween = gsap.to(progressRef.current, {
      attr: { strokeDashoffset: offset },
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.out",
    });

    return () => {
      tween.kill();
    };
  }, [progress]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

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
    { scope: coreRef },
  );

  return (
    <div
      className={cn("relative grid place-items-center", styles.container)}
      aria-hidden="true"
    >
      <div className="absolute inset-[18%] rounded-full bg-primary/10 blur-2xl" />
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full overflow-visible"
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
  );
}

function FloatingTip({
  text,
  index,
  total,
}: {
  text: string;
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current || prefersReducedMotion()) return;

      const angle = (index / total) * Math.PI * 2;
      const radius = 30 + Math.random() * 18;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;
      const startRotation = (Math.random() - 0.5) * 24;

      gsap.set(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: `${startX}vw`,
        y: `${startY}vh`,
        rotation: startRotation,
        opacity: 0,
        scale: 0.85,
      });

      const tl = gsap.timeline({ delay: index * 0.18 });

      tl.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      });

      const drift = () => {
        if (!cardRef.current) return;

        const nextX = (Math.random() - 0.5) * 80;
        const nextY = (Math.random() - 0.5) * 50;
        const nextRotation = (Math.random() - 0.5) * 30;
        const duration = 5 + Math.random() * 6;

        gsap.to(cardRef.current, {
          x: `${startX + nextX * 0.3}vw`,
          y: `${startY + nextY * 0.3}vh`,
          rotation: startRotation + nextRotation,
          duration,
          ease: "sine.inOut",
          onComplete: drift,
        });
      };

      drift();
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={cardRef}
      className="pointer-events-none fixed left-1/2 top-1/2 z-10 max-w-[260px] will-change-transform"
    >
      <div className="glass-strong flex items-start gap-3 rounded-2xl border border-white/40 p-4 shadow-lg">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  );
}

export function GenerationLoader({
  className,
  label = "生成中",
  size = "md",
  phases,
  showProgress = false,
  tips = DEFAULT_TIPS,
  fullscreen = false,
}: GenerationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

  const hasPhases = Boolean(phases?.length);
  const phaseIndex = getPhaseIndex(progress, phases?.length ?? 0);
  const explicitPhase = hasPhases ? phases?.[phaseIndex] ?? label : undefined;
  const currentPhase =
    explicitPhase ?? (showProgress ? getDefaultStageLabel(progress) : label);
  const roundedProgress = Math.round(progress);

  useEffect(() => {
    if (!hasPhases && !showProgress) return;

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= MAX_ESTIMATED_PROGRESS) return current;
        const remaining = MAX_ESTIMATED_PROGRESS - current;
        const increment = Math.max(0.12, remaining * 0.018);
        return Math.min(MAX_ESTIMATED_PROGRESS, current + increment);
      });
    }, PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(progressTimer);
  }, [hasPhases, showProgress]);

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
      );
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
      scope: phaseRef,
      dependencies: [currentPhase],
      revertOnUpdate: true,
    },
  );

  const accessibleLabel = showProgress
    ? `${currentPhase}，当前进度 ${roundedProgress}%`
    : currentPhase;

  if (fullscreen) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center",
          "frosted-overlay",
          className,
        )}
        role="status"
        aria-live="polite"
        aria-label={accessibleLabel}
      >
        {tips.slice(0, 6).map((tip, index) => (
          <FloatingTip
            key={`${tip}-${index}`}
            text={tip}
            index={index}
            total={Math.min(tips.length, 6)}
          />
        ))}

        <div className="relative z-20 flex flex-col items-center gap-6">
          <CoreIndicator size="lg" progress={progress} showProgress={showProgress} />

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span
                ref={phaseRef}
                className="text-base font-medium text-foreground"
              >
                {currentPhase}
              </span>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground">
              提示词越具体，画面越可控
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col items-center justify-center gap-5", className)}
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
    >
      <CoreIndicator size={size} progress={progress} showProgress={showProgress} />

      {currentPhase && (
        <span
          ref={phaseRef}
          className={cn(
            "font-medium text-foreground will-change-transform",
            sizeStyles[size].text,
          )}
        >
          {currentPhase}
        </span>
      )}
    </div>
  );
}
