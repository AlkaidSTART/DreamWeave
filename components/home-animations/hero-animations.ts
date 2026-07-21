import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupHeroAnimations(container: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.from(".hero-badge", { opacity: 0, y: 20, duration: 0.6 })
    .from(".hero-title", { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
    .from(".hero-subtitle", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
    .from(".hero-ctas", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6");

  gsap.to(".hero-glow-primary", {
    y: -120,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.to(".hero-glow-mint", {
    y: -80,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  return tl;
}
