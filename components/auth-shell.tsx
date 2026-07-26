"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/home-animation-utils";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const mode = pathname === "/register" ? "register" : "login";

  useGSAP(
    () => {
      if (!cardRef.current || prefersReducedMotion()) return;

      const ctx = gsap.context(() => {
        const direction = mode === "register" ? 1 : -1;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          cardRef.current,
          {
            opacity: 0,
            y: 48,
            scale: 0.92,
            rotateY: direction * 12,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.75,
          },
        )
          .fromTo(
            ".auth-brand",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.45",
          )
          .fromTo(
            ".auth-title",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.45 },
            "-=0.3",
          )
          .fromTo(
            ".auth-form > *",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
            "-=0.25",
          )
          .fromTo(
            ".auth-footer",
            { opacity: 0 },
            { opacity: 1, duration: 0.4 },
            "-=0.2",
          );

        gsap.to(cardRef.current, {
          y: -6,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        return () => {
          tl.kill();
        };
      }, cardRef.current);

      return () => ctx.revert();
    },
    { scope: containerRef, dependencies: [mode] },
  );

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute inset-0 -z-10 home-liquid-bg" />

      <div
        ref={cardRef}
        className={cn(
          "w-full max-w-md rounded-3xl border border-white/45 bg-white/65 p-8 shadow-xl backdrop-blur-2xl",
          "dark:border-white/10 dark:bg-[rgba(30,34,45,0.72)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </main>
  );
}
