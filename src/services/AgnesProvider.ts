import type { CreateGenerationRequest, GenerationJob, GeneratedImage } from "@/lib/types";
import { ImageGenerationError, type ImageGenerationProvider } from "@/src/services/ImageGenerationService";

interface AgnesResponse {
  created: number;
  data: Array<{
    url: string | null;
    b64_json: string | null;
    revised_prompt: string | null;
  }>;
}

interface AgnesRequestBody {
  model: string;
  prompt: string;
  size: string;
  ratio?: string;
  return_base64?: boolean;
  extra_body: {
    response_format?: "url" | "b64_json";
    image?: string[];
  };
}

function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ImageGenerationError(
      `缺少环境变量：${key}`,
      "AGNES_MISSING_CONFIG",
    );
  }
  return value;
}

export class AgnesProvider implements ImageGenerationProvider {
  async generate(
    request: CreateGenerationRequest,
    _job: GenerationJob,
    index: number,
  ): Promise<GeneratedImage> {
    const baseUrl = getEnv("IMAGE_GENERATION_API_URL") ?? "https://apihub.agnes-ai.com/v1/images/generations";
    const apiKey = requireEnv("IMAGE_GENERATION_API_KEY");

    const model = request.model ?? getEnv("AGNES_MODEL") ?? "agnes-image-2.1-flash";
    const size = request.size ?? getEnv("AGNES_SIZE") ?? "2K";
    const ratio = request.ratio ?? getEnv("AGNES_RATIO") ?? "1:1";
    const isImageToImage = request.type === "image-to-image";
    const isSingleImage = request.imageCount === 1;

    const responseFormatFromBase64 =
      request.returnBase64 === true ? "b64_json" :
      request.returnBase64 === false ? "url" :
      undefined;
    const responseFormat =
      request.responseFormat ??
      responseFormatFromBase64 ??
      (getEnv("AGNES_RESPONSE_FORMAT") as "url" | "b64_json" | undefined) ??
      (isSingleImage ? "b64_json" : "url");
    const useBase64 = responseFormat === "b64_json";

    const body: AgnesRequestBody = {
      model,
      prompt: request.prompt,
      size,
      ratio,
      extra_body: {},
    };

    if (isImageToImage) {
      const inputImage = request.inputImage;
      if (!inputImage) {
        throw new ImageGenerationError(
          "图生图模式必须提供 inputImage",
          "AGNES_MISSING_INPUT_IMAGE",
        );
      }
      body.extra_body.image = [inputImage];
    }

    if (isImageToImage) {
      body.extra_body.response_format = responseFormat;
    } else if (useBase64) {
      body.return_base64 = true;
    } else {
      body.extra_body.response_format = responseFormat;
    }

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "未知错误");
        throw new ImageGenerationError(
          `Agnes API 返回错误 ${response.status}: ${errorText}`,
          `AGNES_${response.status}`,
        );
      }

      const result = (await response.json()) as AgnesResponse;
      const imageData = result.data?.[0];

      if (!imageData) {
        throw new ImageGenerationError(
          "Agnes API 响应中未包含图片数据",
          "AGNES_EMPTY_RESPONSE",
        );
      }

      if (imageData.b64_json) {
        return {
          id: `img-${index + 1}`,
          url: `data:image/png;base64,${imageData.b64_json}`,
          status: "completed",
        };
      }

      if (imageData.url) {
        return {
          id: `img-${index + 1}`,
          url: imageData.url,
          status: "completed",
        };
      }

      throw new ImageGenerationError(
        "Agnes API 响应中缺少 url 和 b64_json",
        "AGNES_INVALID_RESPONSE",
      );
    } catch (error) {
      if (error instanceof ImageGenerationError) throw error;
      throw new ImageGenerationError(
        error instanceof Error ? error.message : "调用 Agnes API 失败",
        "AGNES_NETWORK_ERROR",
      );
    }
  }
}
