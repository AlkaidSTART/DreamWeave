"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/stores/toast-store";

interface ImageLightboxProps {
  imageUrl: string;
  prompt: string;
  onClose: () => void;
  className?: string;
}

export function ImageLightbox({ imageUrl, prompt, onClose, className }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `dreamweave-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("提示词已复制");
    } catch {
      toast.error("复制失败", "请手动复制");
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300",
        className,
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="关闭"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative h-[75vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imageUrl}
          alt="全屏预览"
          fill
          className="rounded-2xl shadow-2xl object-contain"
          sizes="90vw"
          priority
        />
      </div>

      <div
        className="mt-6 w-full max-w-lg rounded-xl bg-white/10 backdrop-blur-md p-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-white/60">提示词</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white/80 hover:text-white hover:bg-white/10"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={handleCopyPrompt}
            >
              复制
            </Button>
            <Button
              size="sm"
              className="h-8 bg-primary hover:bg-primary-hover text-white"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
            >
              下载
            </Button>
          </div>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-white/90">{prompt}</p>
      </div>
    </div>
  );
}