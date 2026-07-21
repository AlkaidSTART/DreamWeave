"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Download, RefreshCw, Copy, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ImageResultCard } from "@/components/image-result-card";
import { getJob, subscribeJobProgress } from "@/lib/api";
import { getJobFromDB, getImagesByJobId, saveJob, saveImage } from "@/lib/db";
import { toast } from "@/stores/toast-store";
import type { GenerationJob, GeneratedImage, StoredImage } from "@/lib/types";

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

async function fetchImageBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) return null;
    return response.blob();
  } catch {
    return null;
  }
}

function isLocalUrl(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("/uploads/");
}

export function ResultView({ initialJob }: ResultViewProps) {
  const [job, setJob] = useState<GenerationJob>(initialJob);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [storedImages, setStoredImages] = useState<Record<string, StoredImage>>({});
  const { copied, copy } = useCopied();

  const persistImage = useCallback(async (image: GeneratedImage) => {
    if (!image.url || storedImages[image.id]?.blob) return;

    const blob = isLocalUrl(image.url) ? null : await fetchImageBlob(image.url);
    if (!blob) {
      setStoredImages((current) => ({
        ...current,
        [image.id]: { ...image, jobId: job.id },
      }));
      return;
    }

    const stored = await saveImage(job.id, image.id, blob, {
      url: image.url,
      width: image.width,
      height: image.height,
      status: image.status,
    });

    setStoredImages((current) => ({
      ...current,
      [image.id]: stored,
    }));
  }, [job.id, storedImages]);

  useEffect(() => {
    let mounted = true;

    async function loadStoredData() {
      try {
        const [storedJob, images] = await Promise.all([
          getJobFromDB(initialJob.id),
          getImagesByJobId(initialJob.id),
        ]);

        if (!mounted) return;

        if (storedJob) {
          setJob(storedJob);
        } else {
          await saveJob(initialJob);
        }

        const imagesMap = images.reduce<Record<string, StoredImage>>((acc, image) => {
          acc[image.id] = image;
          return acc;
        }, {});
        setStoredImages(imagesMap);
      } catch {
        // 本地存储加载失败不影响主流程
      }
    }

    void loadStoredData();

    return () => {
      mounted = false;
    };
  }, [initialJob]);

  useEffect(() => {
    const unsubscribe = subscribeJobProgress(job.id, {
      onProgress: (progress) =>
        setJob((current) => ({ ...current, progress })),
      onStatusChange: (status) =>
        setJob((current) => ({ ...current, status: status as GenerationJob["status"] })),
      onResult: (result) => {
        setJob((current) => ({
          ...current,
          results: current.results.map((item) =>
            item.id === result.id ? result : item,
          ),
        }));
        if (result.url) {
          void persistImage(result);
        }
      },
      onComplete: async (completedJob) => {
        setJob(completedJob);
        await saveJob(completedJob);
        completedJob.results.forEach((result) => {
          if (result.url) void persistImage(result);
        });
      },
      onError: (error) => {
        toast.error("生成失败", error);
        setJob((current) => ({ ...current, status: "failed", error }));
      },
    });

    return () => unsubscribe();
  }, [job.id, persistImage]);

  const handleRetry = async () => {
    try {
      const refreshed = await getJob(job.id);
      setJob(refreshed);
      await saveJob(refreshed);
    } catch {
      toast.error("刷新任务失败");
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

  const handleRegenerate = (image: GeneratedImage) => {
    toast.info("重新生成开发中", `图片 ${image.id} 的单张重试将在后续版本支持`);
  };

  const completedCount = job.results.filter(
    (result) => result.status === "completed" && result.url,
  ).length;

  const handleDownloadAll = () => {
    job.results.forEach((result, index) => {
      const stored = storedImages[result.id];
      const url = stored?.objectUrl || result.url;
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.download = `dreamweave-${job.id}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const isImageToImage = job.type === "image-to-image" && Boolean(job.inputImage);

  const resultsWithStoredUrls = job.results.map((result) => {
    const stored = storedImages[result.id];
    if (stored?.objectUrl) {
      return { ...result, url: stored.objectUrl };
    }
    return result;
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 md:px-6 lg:px-8">
      <Card className="sticky top-20 z-30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              {job.status === "processing" && (
                <Spinner size="sm" className="text-primary" />
              )}
              <span>
                {job.status === "pending" && "等待生成..."}
                {job.status === "processing" && `正在生成 ${completedCount}/${job.imageCount} 张图片`}
                {job.status === "completed" && "生成完成"}
                {job.status === "failed" && "生成失败"}
              </span>
              {job.status === "processing" && (
                <span className="text-xs text-muted-foreground">
                  预计还需 10-30 秒
                </span>
              )}
            </div>
            <Progress value={job.progress} />
          </div>
          <div className="flex items-center gap-2">
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
      </Card>

      {isImageToImage && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">原图对比</h2>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ImageIcon className="h-4 w-4" />}
              onClick={() => setShowOriginal((prev) => !prev)}
            >
              {showOriginal ? "隐藏原图" : "查看原图"}
            </Button>
          </div>
          {showOriginal && job.inputImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-card-elevated">
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
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {resultsWithStoredUrls.map((result) => (
          <ImageResultCard
            key={result.id}
            image={result}
            onPreview={setPreviewImage}
            onRegenerate={handleRegenerate}
          />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">提示词信息</h2>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            onClick={() => handleCopyPrompt(job.refinedPrompt || job.prompt, job.refinedPrompt ? "润色提示词" : "原始提示词")}
          >
            {copied ? "已复制" : "复制提示词"}
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <span className="text-xs text-muted-foreground">原始提示词</span>
            <p className="mt-1 text-sm text-foreground">{job.prompt || "无"}</p>
          </div>
          {job.refinedPrompt && job.refinedPrompt !== job.prompt && (
            <div>
              <span className="text-xs text-muted-foreground">润色后提示词</span>
              <p className="mt-1 text-sm text-foreground">{job.refinedPrompt}</p>
            </div>
          )}
          {job.skillId && (
            <div>
              <span className="text-xs text-muted-foreground">使用模板</span>
              <p className="mt-1 text-sm text-foreground">{job.skillId}</p>
            </div>
          )}
        </div>
      </Card>

      {previewImage?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative h-[90vh] w-[90vw]">
            <Image
              src={previewImage.url}
              alt="预览"
              fill
              className="rounded-2xl object-contain shadow-2xl"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
