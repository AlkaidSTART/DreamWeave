"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/home-animation-utils";
import { setupHeroAnimations } from "./home-animations/hero-animations";
import { setupScrollRevealAnimations } from "./home-animations/scroll-animations";
import { setupCardHoverEffects } from "./home-animations/card-effects";

gsap.registerPlugin(ScrollTrigger);

export function HomeAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      setupHeroAnimations(containerRef.current!);
      setupScrollRevealAnimations();
      setupCardHoverEffects();
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
