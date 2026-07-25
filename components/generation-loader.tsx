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
  progress?: number;
  tips?: string[];
  fullscreen?: boolean;
}

const sizeStyles = {
  sm: { container: "h-24 w-24", text: "text-xs", progress: "text-xl", centerSize: "h-8 w-8" },
  md: { container: "h-40 w-40", text: "text-sm", progress: "text-3xl", centerSize: "h-12 w-12" },
  lg: { container: "h-60 w-60", text: "text-base", progress: "text-4xl", centerSize: "h-16 w-16" },
};

const PROGRESS_RADIUS = 78;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PROGRESS_INTERVAL_MS = 400;
const MAX_ESTIMATED_PROGRESS = 85;

const DEFAULT_TIPS = [
  "用具体名词开头，比如『一只橘猫』而不是『一只猫』",
  "加上光线描述：柔柔阳光、霓虹灯光、晨光...",
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
  const outerOrbitRef = useRef<SVGGElement>(null);
  const innerOrbitRef = useRef<SVGGElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const roundedProgress = Math.round(Math.min(100, Math.max(0, progress)));
  const styles = sizeStyles[size];

  useEffect(() => {
    if (!progressRef.current) return;

    const offset =
      PROGRESS_CIRCUMFERENCE - (roundedProgress / 100) * PROGRESS_CIRCUMFERENCE;
    const tween = gsap.to(progressRef.current, {
      attr: { strokeDashoffset: offset },
      duration: prefersReducedMotion() ? 0 : 0.4,
      ease: "power2.out",
    });

    return () => {
      tween.kill();
    };
  }, [roundedProgress]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // 顺时针外层星轨
      gsap.to(outerOrbitRef.current, {
        rotation: 360,
        svgOrigin: "100 100",
        duration: 20,
        ease: "none",
        repeat: -1,
      });

      // 逆时针内层星轨
      gsap.to(innerOrbitRef.current, {
        rotation: -360,
        svgOrigin: "100 100",
        duration: 14,
        ease: "none",
        repeat: -1,
      });

      // 中心核呼吸发光
      gsap.to(coreRef.current, {
        scale: 1.12,
        opacity: 0.9,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: coreRef },
  );

  const gradientId = `loader-grad-${size}`;
  const glowFilterId = `loader-glow-${size}`;

  return (
    <div
      className={cn("relative grid place-items-center select-none", styles.container)}
      aria-hidden="true"
    >
      {/* 渐变弥散背景霓虹晕 */}
      <div className="absolute inset-[10%] rounded-full bg-gradient-to-tr from-primary/20 via-indigo-500/20 to-purple-500/20 blur-3xl animate-pulse" />

      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 外围微光轨底色 */}
        <circle
          cx="100"
          cy="100"
          r={PROGRESS_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary/10"
        />

        {/* 动态进度环带 */}
        {showProgress && (
          <circle
            ref={progressRef}
            cx="100"
            cy="100"
            r={PROGRESS_RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={PROGRESS_CIRCUMFERENCE}
            strokeDashoffset={PROGRESS_CIRCUMFERENCE}
            filter={`url(#${glowFilterId})`}
            transform="rotate(-90 100 100)"
          />
        )}

        {/* 顺时针旋转刻度与星点 */}
        <g ref={outerOrbitRef} className="will-change-transform">
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 12"
            className="text-foreground/15"
          />
          <circle cx="192" cy="100" r="3.5" className="fill-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
          <circle cx="8" cy="100" r="2" className="fill-purple-400 opacity-70" />
        </g>

        {/* 逆时针旋转内圈星点 */}
        <g ref={innerOrbitRef} className="will-change-transform">
          <circle
            cx="100"
            cy="100"
            r="64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 16"
            className="text-primary/20"
          />
          <circle cx="164" cy="100" r="2.5" className="fill-sky-400 drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]" />
        </g>
      </svg>

      {/* 中心高光发光发热核 */}
      <div
        ref={coreRef}
        className={cn(
          "relative grid place-items-center rounded-full border border-white/40 bg-gradient-to-br from-indigo-500 via-primary to-purple-600 shadow-[0_0_32px_rgba(99,102,241,0.45)] will-change-transform",
          styles.centerSize,
        )}
      >
        <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)] animate-ping" />
      </div>

      {/* 数字实时进度 */}
      {showProgress && (
        <span
          className={cn(
            "absolute font-display font-bold tabular-nums bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent drop-shadow-sm",
            styles.progress,
          )}
          style={{ transform: "translateY(160%)" }}
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
      const radius = 32 + Math.random() * 16;
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;
      const startRotation = (Math.random() - 0.5) * 16;

      gsap.set(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: `${startX}vw`,
        y: `${startY}vh`,
        rotation: startRotation,
        opacity: 0,
        scale: 0.88,
      });

      const tl = gsap.timeline({ delay: index * 0.16 });

      tl.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      });

      const drift = () => {
        if (!cardRef.current) return;

        const nextX = (Math.random() - 0.5) * 60;
        const nextY = (Math.random() - 0.5) * 40;
        const nextRotation = (Math.random() - 0.5) * 20;
        const duration = 6 + Math.random() * 5;

        gsap.to(cardRef.current, {
          x: `${startX + nextX * 0.25}vw`,
          y: `${startY + nextY * 0.25}vh`,
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
      className="pointer-events-none fixed left-1/2 top-1/2 z-10 max-w-[270px] will-change-transform"
    >
      <div className="glass-strong flex items-start gap-3.5 rounded-2xl border border-white/30 bg-card/60 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs sm:text-sm leading-relaxed font-medium text-foreground/90">{text}</p>
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
  progress: externalProgress,
  tips = DEFAULT_TIPS,
  fullscreen = false,
}: GenerationLoaderProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

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

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
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
          "fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-2xl bg-background/80",
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

        <div className="relative z-20 flex flex-col items-center gap-12">
          <CoreIndicator size="lg" progress={activeProgress} showProgress={showProgress} />

          <div className="flex flex-col items-center gap-2.5 text-center mt-6">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span
                ref={phaseRef}
                className="text-sm font-semibold tracking-wide text-foreground"
              >
                {currentPhase}
              </span>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground/80">
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
      className={cn("flex flex-col items-center justify-center gap-10", className)}
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
    >
      <CoreIndicator size={size} progress={activeProgress} showProgress={showProgress} />

      {currentPhase && (
        <span
          ref={phaseRef}
          className={cn(
            "font-medium text-foreground will-change-transform mt-4",
            sizeStyles[size].text,
          )}
        >
          {currentPhase}
        </span>
      )}
    </div>
  );
}
