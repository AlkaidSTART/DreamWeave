"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const mode = pathname === "/register" ? "register" : "login";

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute inset-0 -z-10 home-liquid-bg" />

      <div
        ref={cardRef}
        data-mode={mode}
        className={cn(
          "auth-shell-card w-full max-w-md rounded-3xl border border-white/45 bg-white/65 p-8 shadow-xl backdrop-blur-2xl",
          "dark:border-white/10 dark:bg-[rgba(30,34,45,0.72)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.38)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </main>
  );
}
