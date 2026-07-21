import { gsap } from "gsap";

export function setupCardHoverEffects() {
  gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -6,
        scale: 1.02,
        boxShadow: "0 12px 32px rgba(31, 38, 135, 0.1)",
        duration: 0.25,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        duration: 0.25,
        ease: "power2.out",
      });
    });
  });
}
