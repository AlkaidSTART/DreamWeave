import type { CreateGenerationRequest, GenerationJob, GeneratedImage } from "@/lib/types";
import { AgnesProvider } from "@/src/services/AgnesProvider";

export class ImageGenerationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ImageGenerationError";
  }
}

export interface ImageGenerationProvider {
  generate(request: CreateGenerationRequest, job: GenerationJob, index: number): Promise<GeneratedImage>;
}

function buildPrompt(request: CreateGenerationRequest): string {
  if (request.skillId) {
    return request.prompt;
  }
  return request.prompt;
}

class PollinationsProvider implements ImageGenerationProvider {
  async generate(
    request: CreateGenerationRequest,
    job: GenerationJob,
    index: number,
  ): Promise<GeneratedImage> {
    const prompt = buildPrompt(request);
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.abs(job.id.split("-").join("").charCodeAt(0) + index * 1000);
    const width = 1024;
    const height = 1024;
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) {
        throw new ImageGenerationError(
          `Pollinations API 返回错误: ${response.status}`,
          `POLLINATIONS_${response.status}`,
        );
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return {
        id: `img-${index + 1}`,
        url: objectUrl,
        width,
        height,
        status: "completed",
      };
    } catch (error) {
      if (error instanceof ImageGenerationError) throw error;
      throw new ImageGenerationError(
        error instanceof Error ? error.message : "调用 Pollinations API 失败",
        "POLLINATIONS_NETWORK_ERROR",
      );
    }
  }
}

class FallbackProvider implements ImageGenerationProvider {
  async generate(_request: CreateGenerationRequest, job: GenerationJob, index: number): Promise<GeneratedImage> {
    return {
      id: `img-${index + 1}`,
      url: `https://picsum.photos/seed/${job.id}-${index}/1024/1024`,
      width: 1024,
      height: 1024,
      status: "completed",
    };
  }
}

export class ImageGenerationService {
  private provider: ImageGenerationProvider;

  constructor(provider?: ImageGenerationProvider) {
    this.provider = provider ?? this.createProvider();
  }

  private createProvider(): ImageGenerationProvider {
    const providerName = process.env.IMAGE_GENERATION_PROVIDER || "agnes";

    switch (providerName) {
      case "agnes":
        return new AgnesProvider();
      case "pollinations":
        return new PollinationsProvider();
      case "fallback":
        return new FallbackProvider();
      default:
        return new AgnesProvider();
    }
  }

  async generateImage(
    request: CreateGenerationRequest,
    job: GenerationJob,
    index: number,
  ): Promise<GeneratedImage> {
    return this.provider.generate(request, job, index);
  }
}
