import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateCounter } from "@/lib/home-animation-utils";

gsap.registerPlugin(ScrollTrigger);

export function setupScrollRevealAnimations() {
  gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
    const headline = section.querySelector(".section-headline");
    const subline = section.querySelector(".section-subline");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        toggleActions: "play none none reverse",
      },
    });

    tl.from(section, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: "power2.out",
    });

    if (headline) {
      tl.from(
        headline,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.4",
      );
    }

    if (subline) {
      tl.from(
        subline,
        {
          opacity: 0,
          y: 16,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3",
      );
    }
  });

  gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((card, index) => {
    gsap.from(card, {
      opacity: 0,
      y: 30,
      scale: 0.96,
      duration: 0.6,
      delay: (index % 3) * 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".stat-value").forEach((el) => {
    const text = el.textContent || "";
    const numericMatch = text.match(/(\d+)/);
    if (!numericMatch) return;

    const target = parseInt(numericMatch[1], 10);
    const suffix = text.replace(/\d+/, "");
    el.textContent = `0${suffix}`;

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => animateCounter(el, target, suffix),
    });
  });

  gsap.utils.toArray<HTMLElement>(".step-card").forEach((card, index) => {
    gsap.from(card, {
      opacity: 0,
      x: index === 1 ? 0 : index === 0 ? -30 : 30,
      y: 20,
      duration: 0.6,
      delay: index * 0.12,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".step-connector").forEach((line) => {
    gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: line,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>(".sample-item").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.5,
      delay: index * 0.06,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });
}
