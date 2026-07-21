"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { GenerationForm } from "@/components/generation-form";
import { createGeneration, uploadImage } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import type { CreateGenerationRequest } from "@/lib/types";

export default function ImageToImagePage() {
  const router = useRouter();
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

      const { jobId } = await createGeneration({
        ...request,
        inputImage: imageUrl,
      });
      toast.success("任务已提交", "正在基于参考图生成...");
      router.push(`/result/${jobId}`);
    } catch (error) {
      setIsUploading(false);
      toast.error(
        "提交失败",
        error instanceof Error ? error.message : "请稍后重试",
      );
    }
  };

  return (
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
          isLoading={isUploading}
        />
      </div>
    </PageShell>
  );
}
