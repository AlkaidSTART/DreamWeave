"use client";

import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PromptInput } from "@/components/ui/prompt-input";
import { CountSelector } from "@/components/count-selector";
import { GenerationLoader } from "@/components/generation-loader";
import { SkillCard } from "@/components/skill-card";
import { UploadZone } from "@/components/upload-zone";
import { ImageConfigBar } from "@/components/image-config-bar";
import { fetchSkills } from "@/lib/api";
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
  const [imageCount, setImageCount] = useState(1);
  const [ratio, setRatio] = useState<ImageRatio>(DEFAULT_RATIO);
  const [quality, setQuality] = useState<ImageQuality>(DEFAULT_QUALITY);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>();
  const [skillsLoading, setSkillsLoading] = useState(true);

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

  const handleSubmit = () => {
    if (!prompt.trim() && type === "text-to-image") {
      toast.error("请输入提示词");
      return;
    }
    if (type === "image-to-image" && !inputImage) {
      toast.error("请上传参考图片");
      return;
    }

    onSubmit({
      type,
      prompt: prompt.trim(),
      imageCount,
      ratio,
      quality,
      skillId: selectedSkillId,
      inputImage: type === "image-to-image" ? inputImage ?? null : null,
    });
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

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <CountSelector value={imageCount} onChange={setImageCount} />
        <Button
          size="lg"
          className="w-full sm:w-auto"
          isLoading={isLoading}
          leftIcon={<Wand2 className="h-5 w-5" />}
          onClick={handleSubmit}
        >
          开始生成
        </Button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl glass-strong">
          <GenerationLoader
            size="lg"
            phases={["正在构思画面", "正在生成图像", "正在润色细节", "即将完成"]}
            showProgress
          />
        </div>
      )}
    </div>
  );
}
