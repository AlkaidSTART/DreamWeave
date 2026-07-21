import type { GenerationType } from "@/lib/types";

const QUALITY_PHRASES = [
  "超高细节",
  "8K 分辨率",
  "专业级画质",
  "清晰锐利",
  "丰富的纹理",
];

const STYLE_PHRASES = [
  "电影级写实风格",
  "细腻的写实渲染",
];

const LIGHTING_PHRASES = [
  "柔和自然光照",
  "戏剧化光影",
  "金色时刻光线",
];

const COMPOSITION_PHRASES = [
  "精致构图",
  "视觉焦点突出",
  "层次丰富",
];

const IMAGE_TO_IMAGE_ENHANCEMENTS = [
  "高信息密度",
  "保留原图结构",
  "丰富细节",
  "清晰纹理",
  "专业质感",
];

function cleanPrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ").replace(/，\s*/g, ", ").replace(/,\s*,+/g, ",");
}

function appendIfMissing(prompt: string, phrases: string[]): string {
  const missing = phrases.filter((phrase) => !prompt.includes(phrase));
  if (missing.length === 0) return prompt;
  return `${prompt}, ${missing.join(", ")}`;
}

function applySkillTemplate(prompt: string, template?: string): string {
  if (!template || !template.includes("{prompt}")) return prompt;
  return template.replace(/\{prompt\}/g, prompt);
}

export class PromptService {
  async refine(prompt: string, type: GenerationType, skillTemplate?: string): Promise<string> {
    if (!prompt.trim()) return prompt;

    let refined = cleanPrompt(prompt);

    if (skillTemplate) {
      refined = applySkillTemplate(refined, skillTemplate);
      refined = cleanPrompt(refined);
    }

    if (type === "image-to-image") {
      refined = appendIfMissing(refined, IMAGE_TO_IMAGE_ENHANCEMENTS);
      refined = appendIfMissing(refined, QUALITY_PHRASES.slice(0, 2));
      return refined;
    }

    refined = appendIfMissing(refined, STYLE_PHRASES);
    refined = appendIfMissing(refined, LIGHTING_PHRASES);
    refined = appendIfMissing(refined, COMPOSITION_PHRASES);
    refined = appendIfMissing(refined, QUALITY_PHRASES);

    return refined;
  }
}

export const promptService = new PromptService();
