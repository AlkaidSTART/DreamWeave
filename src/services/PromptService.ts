import type { GenerationType, SkillType } from "@/lib/types";

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

const IMAGE_TO_IMAGE_ADD_OR_REMOVE = [
  "添加丰富细节",
  "清晰纹理",
  "移除低质量",
  "移除模糊元素",
];

const IMAGE_TO_IMAGE_PRESERVE = [
  "保留原图主体结构",
  "保留核心构图",
  "保留原图空间关系",
];

const POLISH_SYSTEM_PROMPT = `You are an expert prompt engineer for AI image generation.
Your task is to rewrite the user's description into a high-quality image-generation prompt.
Rules:
1. Preserve the user's original intent; do not add unrelated elements.
2. Enhance lighting, composition, texture, and style details.
3. Prefer concise English output while keeping the original language if the input is clearly in Chinese.
4. Output only the final prompt. No explanations, no quotation marks, no markdown.`;

interface AgnesChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function resolveChatApiUrl(): string {
  const explicitUrl = getEnv("AGNES_CHAT_API_URL");
  if (explicitUrl) return explicitUrl;

  const imageUrl = getEnv("IMAGE_GENERATION_API_URL");
  if (imageUrl) {
    return imageUrl.replace("/images/generations", "/chat/completions");
  }

  throw new Error(
    "缺少 Agnes API URL 配置，请设置 AGNES_CHAT_API_URL 或 IMAGE_GENERATION_API_URL",
  );
}

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

function buildImageToImagePrompt(
  changeRequest: string,
  styleOrScene?: string,
): string {
  const parts: string[] = [];

  if (changeRequest) {
    parts.push(`改变要求：${changeRequest}`);
  }

  if (styleOrScene) {
    parts.push(`新风格/场景：${styleOrScene}`);
  }

  parts.push(`需要添加或移除的元素：${IMAGE_TO_IMAGE_ADD_OR_REMOVE.join("、")}`);
  parts.push(`需要保留的元素：${IMAGE_TO_IMAGE_PRESERVE.join("、")}`);

  return parts.join("，");
}

function isPhotorealisticType(type?: SkillType): boolean {
  return type === undefined || type === "general" || type === "photography" || type === "cinematic";
}

function applyQualityPhrases(prompt: string, type?: SkillType): string {
  let refined = prompt;

  if (isPhotorealisticType(type)) {
    refined = appendIfMissing(refined, STYLE_PHRASES);
    refined = appendIfMissing(refined, LIGHTING_PHRASES);
    refined = appendIfMissing(refined, COMPOSITION_PHRASES);
  }

  refined = appendIfMissing(refined, QUALITY_PHRASES);
  return refined;
}

export class PromptService {
  async refine(
    prompt: string,
    type: GenerationType,
    skillTemplate?: string,
    skillType?: SkillType,
  ): Promise<string> {
    if (!prompt.trim()) return prompt;

    let refined = cleanPrompt(prompt);

    if (type === "image-to-image") {
      const styleOrScene = skillTemplate
        ? applySkillTemplate(refined, skillTemplate)
        : undefined;
      return buildImageToImagePrompt(refined, styleOrScene);
    }

    if (skillTemplate) {
      refined = applySkillTemplate(refined, skillTemplate);
      refined = cleanPrompt(refined);
    }

    refined = applyQualityPhrases(refined, skillType);
    return refined;
  }

  async polish(
    prompt: string,
    type: GenerationType,
    skillTemplate?: string,
    skillType?: SkillType,
  ): Promise<string> {
    if (!prompt.trim()) return prompt;

    const refined = await this.refine(prompt, type, skillTemplate, skillType);

    if (type === "image-to-image") {
      return refined;
    }

    return this.callAgnesChat(refined, skillType);
  }

  private async callAgnesChat(
    prompt: string,
    skillType?: SkillType,
  ): Promise<string> {
    const apiKey =
      getEnv("AGNES_CHAT_API_KEY") ?? getEnv("IMAGE_GENERATION_API_KEY");
    const baseUrl = resolveChatApiUrl();
    const model = getEnv("AGNES_CHAT_MODEL") ?? "agnes-2.0-flash";

    if (!apiKey) {
      throw new Error("缺少 Agnes Chat API Key，请设置 AGNES_CHAT_API_KEY 或 IMAGE_GENERATION_API_KEY");
    }

    const userPrompt = `Skill type: ${skillType ?? "general"}\nOriginal description: ${prompt}\n\nRewrite this into a high-quality image-generation prompt.`;

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: POLISH_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "未知错误");
        throw new Error(`Agnes Chat API 返回错误 ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as AgnesChatResponse;
      const content = result.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("Agnes Chat API 响应中缺少内容");
      }

      return content;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("调用 Agnes Chat API 失败");
    }
  }
}

export const promptService = new PromptService();
