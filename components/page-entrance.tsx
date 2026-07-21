"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export function PageEntrance({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "transform",
      });
    }, ref.current);

    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
