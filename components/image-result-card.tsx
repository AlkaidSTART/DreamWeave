"use client";

import { Download, Maximize2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card-elevated p-3 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-card">
        {image.status === "completed" && image.url ? (
          <img
            src={image.url}
            alt="生成结果"
            className="h-full w-full object-cover animate-reveal"
            loading="lazy"
          />
        ) : image.status === "failed" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-error">
            <RefreshCw className="h-6 w-6" />
            <span className="text-sm">生成失败</span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner className="text-primary" />
            <span className="text-sm">生成中...</span>
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
