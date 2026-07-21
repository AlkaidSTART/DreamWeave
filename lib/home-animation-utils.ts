import { gsap } from "gsap";

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function animateCounter(
  element: HTMLElement,
  target: number,
  suffix: string,
  duration = 1.5,
) {
  const obj = { value: 0 };

  return gsap.to(obj, {
    value: target,
    duration,
    ease: "power2.out",
    snap: { value: 1 },
    onUpdate: () => {
      element.textContent = `${Math.round(obj.value)}${suffix}`;
    },
  });
}
