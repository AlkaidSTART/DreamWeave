"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PromptInput } from "@/components/ui/prompt-input";
import { CountSelector } from "@/components/count-selector";
import { GenerationLoader } from "@/components/generation-loader";
import { SkillCard } from "@/components/skill-card";
import { UploadZone } from "@/components/upload-zone";
import { ImageConfigBar } from "@/components/image-config-bar";
import { fetchSkills, refinePrompt } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { DEFAULT_QUALITY, DEFAULT_RATIO } from "@/lib/image-config";
import type {
  CreateGenerationRequest,
  GenerationType,
  Skill,
  ImageRatio,
  ImageQuality,
} from "@/lib/types";

interface GenerationFormProps {
  type: GenerationType;
  inputImage?: string | null;
  onInputImageChange?: (file: File | null, previewUrl: string | null) => void;
  onSubmit: (request: CreateGenerationRequest) => void;
  isLoading?: boolean;
  className?: string;
}

export function GenerationForm({
  type,
  inputImage,
  onInputImageChange,
  onSubmit,
  isLoading,
  className,
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [polishedPrompt, setPolishedPrompt] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [ratio, setRatio] = useState<ImageRatio>(DEFAULT_RATIO);
  const [quality, setQuality] = useState<ImageQuality>(DEFAULT_QUALITY);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>();
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPolishReview, setShowPolishReview] = useState(false);

  useEffect(() => {
    fetchSkills()
      .then((data) => {
        setSkills(data);
        const defaultSkill = data.find((skill) => skill.isDefault);
        if (defaultSkill) setSelectedSkillId(defaultSkill.id);
      })
      .catch(() => toast.error("模板加载失败", "请稍后重试"))
      .finally(() => setSkillsLoading(false));
  }, []);

  const handlePolish = async () => {
    if (!prompt.trim() && type === "text-to-image") {
      toast.error("请输入提示词");
      return;
    }
    if (type === "image-to-image" && !inputImage) {
      toast.error("请上传参考图片");
      return;
    }

    setIsPolishing(true);
    try {
      const result = await refinePrompt(
        type === "text-to-image" ? prompt.trim() : prompt,
        type,
        selectedSkillId,
      );
      setPolishedPrompt(result.polishedPrompt);
      setShowPolishReview(true);
    } catch (error) {
      toast.error(
        "润色失败",
        error instanceof Error ? error.message : "请稍后重试",
      );
    } finally {
      setIsPolishing(false);
    }
  };

  const handleConfirmGenerate = () => {
    if (!polishedPrompt.trim()) {
      toast.error("提示词不能为空");
      return;
    }

    onSubmit({
      type,
      prompt: polishedPrompt.trim(),
      imageCount,
      ratio,
      quality,
      skillId: selectedSkillId,
      inputImage: type === "image-to-image" ? inputImage ?? null : null,
    });
  };

  const handleResetPolish = () => {
    setShowPolishReview(false);
    setPolishedPrompt("");
  };

  return (
    <div className={cn("relative mx-auto w-full max-w-3xl space-y-6", className)}>
      {type === "image-to-image" && onInputImageChange && (
        <UploadZone value={inputImage} onChange={onInputImageChange} />
      )}

      <div className="space-y-3">
        <label htmlFor="prompt" className="text-sm font-medium text-foreground">
          {type === "text-to-image" ? "描述你想要的画面" : "补充描述（可选）"}
        </label>
        <PromptInput
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onClear={() => setPrompt("")}
          placeholder={
            type === "text-to-image"
              ? "例如：一只可爱的小猫在草地上玩耍，阳光柔和，8k 高清"
              : "描述想要的风格或变化，不填则让 AI 自由发挥"
          }
          maxLength={1000}
        />
        <ImageConfigBar
          ratio={ratio}
          quality={quality}
          onRatioChange={setRatio}
          onQualityChange={setQuality}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">风格模板</span>
          {skillsLoading && <GenerationLoader size="sm" label="" />}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selectedSkillId === skill.id}
              onClick={() =>
                setSelectedSkillId((current) =>
                  current === skill.id ? undefined : skill.id,
                )
              }
            />
          ))}
        </div>
      </div>

      {showPolishReview && (
        <div className="space-y-3 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              润色后的提示词
            </span>
            <span className="text-xs text-muted-foreground">
              可编辑，确认后生成
            </span>
          </div>
          <PromptInput
            value={polishedPrompt}
            onChange={(event) => setPolishedPrompt(event.target.value)}
            onClear={() => setPolishedPrompt("")}
            placeholder="润色后的提示词"
            maxLength={2000}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={handleResetPolish}
              disabled={isLoading}
            >
              返回修改
            </Button>
            <Button
              variant="secondary"
              onClick={handlePolish}
              isLoading={isPolishing}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              重新润色
            </Button>
            <Button
              onClick={handleConfirmGenerate}
              isLoading={isLoading}
              leftIcon={<Check className="h-4 w-4" />}
            >
              确认生成
            </Button>
          </div>
        </div>
      )}

      {!showPolishReview && (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <CountSelector value={imageCount} onChange={setImageCount} />
          <Button
            size="lg"
            className="w-full sm:w-auto"
            isLoading={isPolishing}
            leftIcon={<Sparkles className="h-5 w-5" />}
            onClick={handlePolish}
          >
            润色提示词
          </Button>
        </div>
      )}

      {isLoading && (
        <GenerationLoader
          fullscreen
          phases={["正在构思画面", "正在生成图像", "正在润色细节", "即将完成"]}
          showProgress
        />
      )}
    </div>
  );
}
