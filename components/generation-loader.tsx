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
  sm: {
    container: "w-28 h-28",
    text: "text-xs",
  },
  md: {
    container: "w-44 h-44",
    text: "text-sm",
  },
  lg: {
    container: "w-64 h-64",
    text: "text-base",
  },
};

const outerParticles = [0, 72, 144, 216, 288];
const middleParticles = [36, 108, 180, 252];

const PROGRESS_RADIUS = 58;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PHASE_INTERVAL_MS = 2800;
const PROGRESS_INTERVAL_MS = 200;

export function GenerationLoader({
  className,
  label = "生成中",
  size = "md",
  phases,
  showProgress = false,
}: GenerationLoaderProps) {
  const hasPhases = phases && phases.length > 0;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<SVGGElement>(null);
  const ring2Ref = useRef<SVGGElement>(null);
  const ring3Ref = useRef<SVGGElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);

  const currentPhase = hasPhases ? phases[phaseIndex] : label;

  useEffect(() => {
    if (!hasPhases && !showProgress) return;

    const phaseTimer = hasPhases
      ? setInterval(() => {
          setPhaseIndex((index) => (index + 1) % phases.length);
        }, PHASE_INTERVAL_MS)
      : null;

    const progressTimer = showProgress
      ? setInterval(() => {
          setProgress((value) => {
            if (value >= 95) return value;
            const remaining = 100 - value;
            const step = Math.max(0.25, remaining * 0.035);
            return Math.min(95, value + step);
          });
        }, PROGRESS_INTERVAL_MS)
      : null;

    return () => {
      if (phaseTimer) clearInterval(phaseTimer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [hasPhases, showProgress, phases]);

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      const ctx = gsap.context(() => {
        const ringOrigin = { svgOrigin: "100 100" };

        gsap.to(ring1Ref.current, {
          rotation: 360,
          duration: 24,
          ease: "none",
          repeat: -1,
          ...ringOrigin,
        });

        gsap.to(ring2Ref.current, {
          rotation: -360,
          duration: 16,
          ease: "none",
          repeat: -1,
          ...ringOrigin,
        });

        gsap.to(ring3Ref.current, {
          rotation: 360,
          duration: 10,
          ease: "none",
          repeat: -1,
          ...ringOrigin,
        });

        gsap.to(coreRef.current, {
          scale: 1.14,
          opacity: 0.8,
          duration: 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        gsap.to(glowRef.current, {
          scale: 1.25,
          opacity: 0.55,
          duration: 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        gsap.fromTo(
          shimmerRef.current,
          { x: "-120%", opacity: 0 },
          {
            x: "120%",
            opacity: 0.45,
            duration: 2,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 0.8,
          },
        );

        if (dotsRef.current) {
          const dots = dotsRef.current.querySelectorAll("span");
          gsap.to(dots, {
            opacity: 0.25,
            y: -2,
            duration: 0.5,
            stagger: 0.12,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      }, containerRef.current);

      return () => ctx.revert();
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      if (!textRef.current || prefersReducedMotion()) return;

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 10, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          ease: "power2.out",
        },
      );
    },
    {
      scope: containerRef,
      dependencies: [currentPhase],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      if (!progressRef.current || prefersReducedMotion()) return;

      const offset = PROGRESS_CIRCUMFERENCE - (progress / 100) * PROGRESS_CIRCUMFERENCE;
      gsap.to(progressRef.current, {
        strokeDashoffset: offset,
        duration: 0.3,
        ease: "power2.out",
      });
    },
    {
      scope: containerRef,
      dependencies: [progress],
      revertOnUpdate: true,
    },
  );

  const styles = sizeStyles[size];
  const showMeta = hasPhases || showProgress;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col items-center justify-center gap-5", className)}
      role="status"
      aria-live="polite"
      aria-label={currentPhase}
    >
      <div className={cn("relative flex items-center justify-center", styles.container)}>
        <div
          ref={glowRef}
          className="absolute inset-[-30%] rounded-full bg-primary/10 blur-3xl will-change-transform"
        />

        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <g ref={ring1Ref} className="will-change-transform">
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="rgba(99,102,241,0.14)"
              strokeWidth="1"
            />
            {outerParticles.map((angle, index) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <circle
                  key={index}
                  cx={100 + 92 * Math.cos(rad)}
                  cy={100 + 92 * Math.sin(rad)}
                  r="2.5"
                  fill="rgba(99,102,241,0.65)"
                />
              );
            })}
          </g>

          <g ref={ring2Ref} className="will-change-transform">
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="rgba(20,184,166,0.18)"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
            {middleParticles.map((angle, index) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <circle
                  key={index}
                  cx={100 + 70 * Math.cos(rad)}
                  cy={100 + 70 * Math.sin(rad)}
                  r="2"
                  fill="rgba(20,184,166,0.75)"
                />
              );
            })}
          </g>

          <g ref={ring3Ref} className="will-change-transform">
            <circle
              cx="100"
              cy="100"
              r="48"
              fill="none"
              stroke="rgba(99,102,241,0.2)"
              strokeWidth="1"
            />
          </g>

          {showProgress && (
            <circle
              ref={progressRef}
              cx="100"
              cy="100"
              r={PROGRESS_RADIUS}
              fill="none"
              stroke="rgba(99,102,241,0.55)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={PROGRESS_CIRCUMFERENCE}
              className="will-change-transform"
              transform="rotate(-90 100 100)"
            />
          )}
        </svg>

        <div
          ref={coreRef}
          className="relative z-10 aspect-square h-[30%] rounded-full bg-gradient-to-br from-primary via-indigo-400 to-mint-400 shadow-[0_0_40px_rgba(99,102,241,0.35)] will-change-transform"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent" />
          <div className="absolute inset-[15%] rounded-full bg-white/20 blur-md" />
        </div>

        <div
          ref={shimmerRef}
          className="pointer-events-none absolute inset-0 z-20 w-full -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent will-change-transform"
        />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        {(currentPhase || showMeta) && (
          <span
            ref={textRef}
            className={cn("inline-flex items-center font-medium text-foreground will-change-transform", styles.text)}
          >
            {currentPhase}
            {hasPhases && (
              <span ref={dotsRef} className="ml-0.5 inline-flex">
                <span className="will-change-transform">.</span>
                <span className="will-change-transform">.</span>
                <span className="will-change-transform">.</span>
              </span>
            )}
          </span>
        )}
        {showProgress && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}
