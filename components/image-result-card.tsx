"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Download, Maximize2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion } from "@/lib/home-animation-utils";
import type { GeneratedImage } from "@/lib/types";

interface ImageResultCardProps {
  image: GeneratedImage;
  onPreview?: (image: GeneratedImage) => void;
  onRegenerate?: (image: GeneratedImage) => void;
}

export function ImageResultCard({
  image,
  onPreview,
  onRegenerate,
}: ImageResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !cardRef.current) return;

    const ctx = gsap.context(() => {
      if (image.status === "completed" && image.url && imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.96, filter: "blur(8px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
            clearProps: "filter",
          },
        );
      }

      if (image.status === "failed" && cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { x: -4 },
          {
            x: 4,
            duration: 0.08,
            repeat: 5,
            yoyo: true,
            ease: "power1.inOut",
            clearProps: "x",
          },
        );
      }
    }, cardRef.current);

    return () => ctx.revert();
  }, [image.status, image.url]);

  return (
    <div
      ref={cardRef}
      className="result-card flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-sm backdrop-blur-md will-change-transform"
    >
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-card/80">
        {image.status === "completed" && image.url ? (
          <div ref={imageRef} className="absolute inset-0 will-change-transform">
            <Image
              src={image.url}
              alt="生成结果"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        ) : image.status === "failed" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-error">
            <RefreshCw className="h-6 w-6" />
            <span className="text-sm">生成失败</span>
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
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              asChild
            >
              <a href={image.url} download>
                下载
              </a>
            </Button>
          )}
          {image.url && onPreview && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Maximize2 className="h-4 w-4" />}
              onClick={() => onPreview(image)}
            >
              放大
            </Button>
          )}
        </div>
        {onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => onRegenerate(image)}
          >
            重试
          </Button>
        )}
      </div>
    </div>
  );
}
