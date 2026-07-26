"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Download, RefreshCw, Copy, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ResultStack } from "@/components/result-stack";
import { ImageLightbox } from "@/components/image-lightbox";
import { createGeneration, getJob, subscribeJobProgress } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { prefersReducedMotion } from "@/lib/home-animation-utils";
import type { GenerationJob, GeneratedImage, JobStatus } from "@/lib/types";

interface ResultViewProps {
  initialJob: GenerationJob;
}

function useCopied() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  };

  return { copied, copy };
}

function getProgressStage(progress: number, status: JobStatus): string {
  if (status === "completed") return "生成完成";
  if (status === "failed") return "生成失败";
  if (progress < 12) return "任务排队中";
  if (progress < 28) return "正在解析提示词";
  if (progress < 45) return "AI 正在构思画面";
  if (progress < 62) return "正在生成图像";
  if (progress < 78) return "正在润色细节";
  if (progress < 90) return "正在保存结果";
  return "即将完成";
}

export function ResultView({ initialJob }: ResultViewProps) {
  const router = useRouter();
  const [job, setJob] = useState<GenerationJob>(initialJob);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [retryingImageId, setRetryingImageId] = useState<string | null>(null);
  const { copied, copy } = useCopied();
  const statusCardRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<string>(initialJob.status);

  useEffect(() => {
    if (job.status === "completed" || job.status === "failed") return;

    const unsubscribe = subscribeJobProgress(job.id, {
      onProgress: (progress) => {
        setJob((current) => ({ ...current, progress }));
      },
      onStatusChange: (status) => {
        setJob((current) => ({ ...current, status: status as JobStatus }));
      },
      onResult: (result) => {
        setJob((current) => {
          const results = current.results.map((item) =>
            item.id === result.id ? result : item,
          );
          return { ...current, results };
        });
      },
      onComplete: (completedJob) => {
        setJob(completedJob);
      },
      onError: (error) => {
        setJob((current) => ({ ...current, status: "failed", error }));
        toast.error("生成失败", error);
      },
    });

    return unsubscribe;
  }, [job.id, job.status]);

  useEffect(() => {
    if (prefersReducedMotion() || !statusCardRef.current) return;

    const currentStatus = job.status;
    const previousStatus = prevStatusRef.current;

    if (currentStatus !== previousStatus) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          statusCardRef.current,
          { scale: 0.98, opacity: 0.85 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform",
          },
        );

        if (currentStatus === "completed") {
          gsap.fromTo(
            statusCardRef.current,
            { boxShadow: "0 0 0 rgba(99,102,241,0)" },
            {
              boxShadow: "0 0 32px rgba(99,102,241,0.28)",
              duration: 0.6,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
              clearProps: "boxShadow",
            },
          );
        }
      }, statusCardRef.current);

      prevStatusRef.current = currentStatus;
      return () => ctx.revert();
    }
  }, [job.status]);

  const handleRetry = async () => {
    try {
      const refreshed = await getJob(job.id);
      setJob(refreshed);
    } catch {
      toast.error("刷新任务失败");
    }
  };

  const handleRetryImage = async (image: GeneratedImage) => {
    if (retryingImageId) return;

    setRetryingImageId(image.id);
    try {
      const newJob = await createGeneration({
        type: job.type,
        prompt: job.refinedPrompt || job.prompt,
        imageCount: 1,
        ratio: job.ratio,
        quality: job.quality,
        skillId: job.skillId,
        inputImage: job.inputImage ?? null,
      });

      toast.success("已重新生成", "正在跳转到新任务...");
      router.push(`/result/${newJob.id}`);
    } catch (error) {
      toast.error(
        "重新生成失败",
        error instanceof Error ? error.message : "请稍后重试",
      );
    } finally {
      setRetryingImageId(null);
    }
  };

  const handleCopyPrompt = async (text: string, label: string) => {
    const ok = await copy(text);
    if (ok) {
      toast.success(`${label}已复制`);
    } else {
      toast.error("复制失败", "请手动复制");
    }
  };

  const completedCount = job.results.filter(
    (result) => result.status === "completed" && result.url,
  ).length;

  const handleDownloadAll = () => {
    job.results.forEach((result, index) => {
      if (!result.url) return;
      const link = document.createElement("a");
      link.href = result.url;
      link.download = `dreamweave-${job.id}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const isImageToImage = job.type === "image-to-image" && Boolean(job.inputImage);

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] w-full max-w-6xl flex-col gap-4 px-4 md:px-6 lg:px-8">
      <Card ref={statusCardRef} className="shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
              {(job.status === "pending" || job.status === "processing") && (
                <Spinner size="sm" className="text-primary" />
              )}
              <span>{getProgressStage(job.progress, job.status)}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {job.progress}%
              </span>
              {job.status === "processing" && completedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  已完成 {completedCount}/{job.imageCount} 张
                </span>
              )}
            </div>
            <Progress value={job.progress} />
          </div>
          <div className="flex items-center gap-2">
            {isImageToImage && job.inputImage && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ImageIcon className="h-4 w-4" />}
                onClick={() => setShowOriginal((prev) => !prev)}
              >
                {showOriginal ? "隐藏原图" : "原图"}
              </Button>
            )}
            {job.status === "failed" && (
              <Button variant="secondary" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={handleRetry}>
                重试
              </Button>
            )}
            {job.status === "completed" && (
              <Button leftIcon={<Download className="h-4 w-4" />} onClick={handleDownloadAll}>
                下载全部
              </Button>
            )}
          </div>
        </div>

        {isImageToImage && showOriginal && job.inputImage && (
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-[10px] bg-card-elevated">
            <Image
              src={job.inputImage}
              alt="参考原图"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}
      </Card>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-md">
        <ResultStack
          images={job.results}
          onPreview={setPreviewImage}
          onRetry={handleRetryImage}
          retryingImageId={retryingImageId}
        />
      </div>

      <Card className="shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">提示词</h2>
            <p className="mt-1 line-clamp-2 text-sm text-foreground">
              {job.refinedPrompt || job.prompt || "无"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            onClick={() => handleCopyPrompt(job.refinedPrompt || job.prompt, job.refinedPrompt ? "润色提示词" : "原始提示词")}
          >
            {copied ? "已复制" : "复制"}
          </Button>
        </div>
      </Card>

      {previewImage?.url && (
        <ImageLightbox
          imageUrl={previewImage.url}
          prompt={job.refinedPrompt || job.prompt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
