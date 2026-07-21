"use client";

import { useRouter } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PageEntrance } from "@/components/page-entrance";
import { GenerationForm } from "@/components/generation-form";
import { createGeneration } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import type { CreateGenerationRequest } from "@/lib/types";

export default function TextToImagePage() {
  const router = useRouter();

  const handleSubmit = async (request: CreateGenerationRequest) => {
    try {
      const { jobId } = await createGeneration(request);
      toast.success("任务已提交", "正在为您生成图片...");
      router.push(`/result/${jobId}`);
    } catch (error) {
      toast.error(
        "提交失败",
        error instanceof Error ? error.message : "请稍后重试",
      );
    }
  };

  return (
    <PageEntrance>
      <PageShell
        title="文生图"
        description="输入提示词，AI 将为你生成高质量图像"
        backHref="/"
        className="pb-20"
      >
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6 lg:px-8">
          <GenerationForm type="text-to-image" onSubmit={handleSubmit} />
        </div>
      </PageShell>
    </PageEntrance>
  );
}
