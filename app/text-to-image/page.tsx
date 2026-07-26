"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PageEntrance } from "@/components/page-entrance";
import { GenerationForm } from "@/components/generation-form";
import { createGeneration } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import type { CreateGenerationRequest } from "@/lib/types";

export default function TextToImagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (request: CreateGenerationRequest) => {
    setIsSubmitting(true);
    try {
      const job = await createGeneration(request);
      toast.success("生成完成", "正在跳转到结果页...");
      router.push(`/result/${job.id}`);
    } catch (error) {
      toast.error(
        "提交失败",
        error instanceof Error ? error.message : "请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
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
          <GenerationForm type="text-to-image" onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </PageShell>
    </PageEntrance>
  );
}
