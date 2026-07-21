"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ImageResultCard } from "@/components/image-result-card";
import { getJob, subscribeJobProgress } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { GenerationJob, GeneratedImage } from "@/lib/types";

interface ResultViewProps {
  initialJob: GenerationJob;
}

export function ResultView({ initialJob }: ResultViewProps) {
  const [job, setJob] = useState<GenerationJob>(initialJob);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeJobProgress(initialJob.id, {
      onProgress: (progress) =>
        setJob((current) => ({ ...current, progress })),
      onStatusChange: (status) =>
        setJob((current) => ({ ...current, status: status as GenerationJob["status"] })),
      onResult: (result) =>
        setJob((current) => ({
          ...current,
          results: current.results.map((item) =>
            item.id === result.id ? result : item,
          ),
        })),
      onComplete: (completedJob) => setJob(completedJob),
      onError: (error) => {
        toast.error("生成失败", error);
        setJob((current) => ({ ...current, status: "failed", error }));
      },
    });

    return () => unsubscribe();
  }, [initialJob.id]);

  const handleRetry = async () => {
    try {
      const refreshed = await getJob(job.id);
      setJob(refreshed);
    } catch {
      toast.error("刷新任务失败");
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {job.results.map((result) => (
          <ImageResultCard
            key={result.id}
            image={result}
            onPreview={setPreviewImage}
          />
        ))}
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-foreground">提示词信息</h2>
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
          <img
            src={previewImage.url}
            alt="预览"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
