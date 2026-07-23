"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationLoader } from "@/components/generation-loader";
import { prefersReducedMotion } from "@/lib/home-animation-utils";
import type { GeneratedImage } from "@/lib/types";

gsap.registerPlugin(useGSAP);

interface ResultStackProps {
  images: GeneratedImage[];
  onPreview?: (image: GeneratedImage) => void;
}

const ROTATIONS = [-8, 5, -3, 10, -6, 4];
const OFFSETS = [
  { x: -120, y: -10 },
  { x: 120, y: -18 },
  { x: -80, y: 60 },
  { x: 80, y: 50 },
  { x: -40, y: -50 },
  { x: 40, y: -42 },
];

export function ResultStack({ images, onPreview }: ResultStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!stackRef.current || prefersReducedMotion()) return;

      const cards = stackRef.current.querySelectorAll(".stack-card");
      if (cards.length === 0) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.92, rotation: 0 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform",
          },
        );
      }, stackRef.current);

      return () => ctx.revert();
    },
    { scope: stackRef, dependencies: [images.length] },
  );

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <GenerationLoader size="md" label="等待结果..." />
      </div>
    );
  }

  if (images.length === 1) {
    const image = images[0];
    return (
      <div ref={stackRef} className="relative h-full w-full">
        <StackCard image={image} index={0} total={1} onPreview={onPreview} />
      </div>
    );
  }

  return (
    <div
      ref={stackRef}
      className="relative flex h-full min-h-[360px] items-center justify-center"
    >
      {images.map((image, index) => (
        <StackCard
          key={image.id}
          image={image}
          index={index}
          total={images.length}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

function StackCard({
  image,
  index,
  total,
  onPreview,
}: {
  image: GeneratedImage;
  index: number;
  total: number;
  onPreview?: (image: GeneratedImage) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rotation = total === 1 ? 0 : ROTATIONS[index % ROTATIONS.length];
  const offset = total === 1 ? { x: 0, y: 0 } : OFFSETS[index % OFFSETS.length];
  const zIndex = 10 + index;

  useGSAP(
    () => {
      if (!cardRef.current || prefersReducedMotion() || total === 1) return;
      gsap.set(cardRef.current, {
        x: offset.x,
        y: offset.y,
        rotation,
        zIndex,
      });
    },
    { scope: cardRef, dependencies: [total] },
  );

  const handleMouseEnter = () => {
    if (!cardRef.current || prefersReducedMotion() || total === 1) return;
    gsap.to(cardRef.current, {
      y: offset.y - 16,
      scale: 1.04,
      rotation: rotation * 0.4,
      duration: 0.35,
      ease: "power2.out",
      zIndex: 100,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || prefersReducedMotion() || total === 1) return;
    gsap.to(cardRef.current, {
      y: offset.y,
      scale: 1,
      rotation,
      duration: 0.35,
      ease: "power2.out",
      zIndex,
    });
  };

  return (
    <div
      ref={cardRef}
      className="stack-card absolute w-[min(72vw,320px)] cursor-pointer will-change-transform"
      style={{ zIndex }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="glass-surface overflow-hidden rounded-2xl border border-white/40 shadow-xl">
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-card/80">
          {image.status === "completed" && image.url ? (
            <Image
              src={image.url}
              alt="生成结果"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80vw, 320px"
            />
          ) : image.status === "failed" ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-error">
              <span className="text-sm">生成失败</span>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <GenerationLoader size="sm" label="生成中..." />
            </div>
          )}
        </div>

        {image.status === "completed" && image.url && (
          <div className="flex items-center justify-between border-t border-border/50 p-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" asChild>
                <a href={image.url} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(image)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
