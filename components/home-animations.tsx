"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HomeAnimations({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".hero-title", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.1,
        ease: "power2.out",
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
      });

      gsap.from(".hero-ctas", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
      });

      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          scale: 0.96,
          duration: 0.6,
          delay: index * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
