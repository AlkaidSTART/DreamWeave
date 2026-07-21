"use client";

import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform",
        },
      );
    }, containerRef.current);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={containerRef} className="flex min-h-full flex-col">
      {children}
    </div>
  );
}
