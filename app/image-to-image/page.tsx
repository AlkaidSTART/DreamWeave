"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PageEntrance } from "@/components/page-entrance";
import { GenerationForm } from "@/components/generation-form";
import { createGeneration, uploadImage } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import type { CreateGenerationRequest } from "@/lib/types";

export default function ImageToImagePage() {
  const router = useRouter();
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputImageChange = (file: File | null, previewUrl: string | null) => {
    setInputFile(file);
    setInputImage(previewUrl);
  };

  const handleSubmit = async (request: CreateGenerationRequest) => {
    if (!inputImage) {
      toast.error("请上传参考图片");
      return;
    }

    try {
      let imageUrl = inputImage;
      if (inputFile) {
        setIsUploading(true);
        const upload = await uploadImage(inputFile);
        imageUrl = upload.url;
        setIsUploading(false);
      }

      setIsSubmitting(true);
      const job = await createGeneration({
        ...request,
        inputImage: imageUrl,
      });
      toast.success("生成完成", "正在跳转到结果页...");
      router.push(`/result/${job.id}`);
    } catch (error) {
      toast.error(
        "提交失败",
        error instanceof Error ? error.message : "请稍后重试",
      );
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <PageEntrance>
      <PageShell
        title="图生图"
        description="上传参考图片，AI 将在此基础上创作新作品"
        backHref="/"
        className="pb-20"
      >
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6 lg:px-8">
          <GenerationForm
            type="image-to-image"
            inputImage={inputImage}
            onInputImageChange={handleInputImageChange}
            onSubmit={handleSubmit}
            isLoading={isUploading || isSubmitting}
          />
        </div>
      </PageShell>
    </PageEntrance>
  );
}
