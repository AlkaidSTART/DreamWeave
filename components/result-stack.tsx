"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Download, Maximize2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion } from "@/lib/home-animation-utils";
import type { GeneratedImage } from "@/lib/types";

gsap.registerPlugin(useGSAP);

interface ResultStackProps {
  images: GeneratedImage[];
  onPreview?: (image: GeneratedImage) => void;
  onRetry?: (image: GeneratedImage) => void;
  retryingImageId?: string | null;
}

export function ResultStack({ images, onPreview, onRetry, retryingImageId }: ResultStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || prefersReducedMotion()) return;

      const cards = containerRef.current.querySelectorAll(".result-card");
      if (cards.length === 0) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "transform",
          },
        );
      }, containerRef.current);

      return () => ctx.revert();
    },
    { scope: containerRef, dependencies: [images.length] },
  );

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <span className="text-sm">等待结果...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full items-center justify-start gap-4 overflow-x-auto overflow-y-hidden px-2 py-4 sm:justify-center"
    >
      {images.map((image) => (
        <ResultCard
          key={image.id}
          image={image}
          onPreview={onPreview}
          onRetry={onRetry}
          isRetrying={retryingImageId === image.id}
        />
      ))}
    </div>
  );
}

function ResultCard({
  image,
  onPreview,
  onRetry,
  isRetrying,
}: {
  image: GeneratedImage;
  onPreview?: (image: GeneratedImage) => void;
  onRetry?: (image: GeneratedImage) => void;
  isRetrying?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current || prefersReducedMotion()) return;

      const imageElement = cardRef.current.querySelector(".result-image");
      if (!imageElement || image.status !== "completed") return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          imageElement,
          { opacity: 0, scale: 0.96, filter: "blur(8px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power2.out",
            clearProps: "filter",
          },
        );
      }, cardRef.current);

      return () => ctx.revert();
    },
    { scope: cardRef, dependencies: [image.status, image.url] },
  );

  return (
    <div
      ref={cardRef}
      className="result-card flex h-full w-[min(72vw,280px)] shrink-0 flex-col gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-sm backdrop-blur-md will-change-transform"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[10px] bg-card/80">
        {image.status === "completed" && image.url ? (
          <div className="result-image absolute inset-0 will-change-transform">
            <Image
              src={image.url}
              alt="生成结果"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 72vw, 280px"
            />
          </div>
        ) : image.status === "failed" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-error">
            <RefreshCw className="h-6 w-6" />
            <span className="text-sm">生成失败</span>
            {onRetry && (
              <Button
                variant="secondary"
                size="sm"
                isLoading={isRetrying}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => onRetry(image)}
              >
                继续生成
              </Button>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" />
            <span className="text-xs">生成中</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {image.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={image.url} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          {image.url && onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(image)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {image.status === "failed" && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            isLoading={isRetrying}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => onRetry(image)}
          >
            继续生成
          </Button>
        )}
      </div>
    </div>
  );
}
