import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AgnesProvider } from "@/src/services/AgnesProvider";
import { ImageGenerationError } from "@/src/services/ImageGenerationService";
import type { CreateGenerationRequest, GenerationJob } from "@/lib/types";

describe("AgnesProvider", () => {
  const originalEnv = { ...process.env };

  const request: CreateGenerationRequest = {
    type: "text-to-image",
    prompt: "a cinematic cat",
    imageCount: 1,
  };

  const job: GenerationJob = {
    id: "job-1",
    type: "text-to-image",
    status: "processing",
    prompt: "a cinematic cat",
    refinedPrompt: "a cinematic cat",
    imageCount: 1,
    results: [{ id: "img-1", url: null, status: "pending" }],
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    process.env.IMAGE_GENERATION_API_KEY = "test-key";
    process.env.IMAGE_GENERATION_API_URL = "https://apihub.agnes-ai.com/v1/images/generations";
    process.env.AGNES_MODEL = "agnes-image-2.1-flash";
    process.env.AGNES_SIZE = "2K";
    process.env.AGNES_RATIO = "16:9";
    process.env.AGNES_RESPONSE_FORMAT = "url";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("should generate image from URL response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: "https://example.com/image.png", b64_json: null, revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    const image = await provider.generate(request, job, 0);

    expect(image.url).toBe("https://example.com/image.png");
    expect(image.status).toBe("completed");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://apihub.agnes-ai.com/v1/images/generations",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("should generate image from base64 response", async () => {
    process.env.AGNES_RESPONSE_FORMAT = "b64_json";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: null, b64_json: "base64data", revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    const image = await provider.generate(request, job, 0);

    expect(image.url).toBe("data:image/png;base64,base64data");
    expect(image.status).toBe("completed");
  });

  it("should support image-to-image with inputImage", async () => {
    const imageToImageRequest: CreateGenerationRequest = {
      ...request,
      type: "image-to-image",
      inputImage: "data:image/png;base64,xxx",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: "https://example.com/edited.png", b64_json: null, revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    const image = await provider.generate(imageToImageRequest, job, 0);

    expect(image.url).toBe("https://example.com/edited.png");
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.extra_body.image).toEqual(["data:image/png;base64,xxx"]);
  });

  it("should throw when API key is missing", async () => {
    delete process.env.IMAGE_GENERATION_API_KEY;
    const provider = new AgnesProvider();
    await expect(provider.generate(request, job, 0)).rejects.toThrow(ImageGenerationError);
  });

  it("should throw when image-to-image lacks inputImage", async () => {
    const imageToImageRequest: CreateGenerationRequest = {
      ...request,
      type: "image-to-image",
    };
    const provider = new AgnesProvider();
    await expect(provider.generate(imageToImageRequest, job, 0)).rejects.toThrow(
      "图生图模式必须提供 inputImage",
    );
  });

  it("should throw on API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const provider = new AgnesProvider();
    await expect(provider.generate(request, job, 0)).rejects.toThrow(ImageGenerationError);
  });
});
