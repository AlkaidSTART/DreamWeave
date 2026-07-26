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

const POLISH_SYSTEM_PROMPT = `你是一位专业的 AI 图像生成提示词工程师。
任务：将用户的描述改写为更适合图像生成模型使用的高质量中文提示词。
规则：
1. 必须保留用户的原始意图，不得添加无关元素。
2. 补充并增强光影、构图、质感、风格、氛围等细节，让提示词更具体、更专业。
3. 输出必须是中文，保持简洁流畅，不要中英混杂。
4. 只返回最终提示词文本，不要解释、不要加引号、不要使用 markdown。`;

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

    const userPrompt = `技能类型：${skillType ?? "general"}\n原始描述：${prompt}\n\n请将上述原始描述改写为高质量的中文图像生成提示词。要求：保留原意，补充光影、构图、质感、风格与氛围细节，输出纯中文。`;


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
