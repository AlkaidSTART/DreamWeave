"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, ImageIcon, Maximize2, Loader2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { PageEntrance } from "@/components/page-entrance";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "@/components/image-lightbox";
import { listJobs } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import type { GenerationJob } from "@/lib/types";

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getJobThumbnail(job: GenerationJob): string | null {
  const completed = job.results.find((result) => result.status === "completed" && result.url);
  return completed?.url ?? null;
}

interface LightboxState {
  imageUrl: string;
  prompt: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        const apiJobs = await listJobs(100);
        if (!cancelled) {
          setJobs(apiJobs);
        }
      } catch {
        if (!cancelled) {
          toast.error("加载图库失败", "请稍后重试");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGallery();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("删除失败");
      }
      setJobs((current) => current.filter((job) => job.id !== jobId));
      toast.success("已删除");
    } catch {
      toast.error("删除失败", "请稍后重试");
    }
  };

  return (
    <PageEntrance>
      <PageShell
        title="图库"
        description="查看你生成的所有作品"
        backHref="/"
        className="pb-20"
      >
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6 lg:px-8">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">加载中...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">还没有作品</p>
                <p className="text-sm text-muted-foreground">去生成一张属于你的图片吧</p>
              </div>
              <Button onClick={() => router.push("/text-to-image")}>开始创作</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const thumbnail = getJobThumbnail(job);
                const completedCount = job.results.filter(
                  (result) => result.status === "completed",
                ).length;

                return (
                  <div
                    key={job.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted/20">
                      {thumbnail ? (
                        <button
                          type="button"
                          onClick={() => setLightbox({ imageUrl: thumbnail, prompt: job.prompt })}
                          className="relative h-full w-full overflow-hidden"
                          aria-label="全屏查看"
                        >
                          <Image
                            src={thumbnail}
                            alt={job.prompt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <Maximize2 className="h-4 w-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                          {job.status === "processing" ? (
                            <RefreshCw className="h-6 w-6 animate-spin" />
                          ) : (
                            <ImageIcon className="h-8 w-8" />
                          )}
                          <span className="text-xs">
                            {job.status === "processing" ? "生成中" : "无预览"}
                          </span>
                        </div>
                      )}
                      <Link
                        href={`/result/${job.id}`}
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-white">
                          {job.prompt}
                        </p>
                      </Link>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/result/${job.id}`} className="line-clamp-1 flex-1 text-sm font-medium text-foreground transition-colors hover:text-primary">
                          {job.prompt}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(job.id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
                          aria-label="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-medium",
                            job.status === "completed" && "bg-mint-500/10 text-mint-500",
                            job.status === "failed" && "bg-error/10 text-error",
                            job.status === "processing" && "bg-primary/10 text-primary",
                          )}
                        >
                          {job.status === "completed" && "已完成"}
                          {job.status === "failed" && "失败"}
                          {job.status === "processing" && "生成中"}
                          {job.status === "pending" && "等待中"}
                        </span>
                        <span>
                          {completedCount}/{job.imageCount} 张 · {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {lightbox && (
          <ImageLightbox
            imageUrl={lightbox.imageUrl}
            prompt={lightbox.prompt}
            onClose={() => setLightbox(null)}
          />
        )}
      </PageShell>
    </PageEntrance>
  );
}
