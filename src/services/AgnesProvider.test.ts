import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AgnesProvider } from "@/src/services/AgnesProvider";
import { ImageGenerationError } from "@/src/services/ImageGenerationService";
import type { CreateGenerationRequest, GenerationJob } from "@/lib/types";

describe("AgnesProvider", () => {
  const originalEnv = { ...process.env };

  const baseRequest: CreateGenerationRequest = {
    type: "text-to-image",
    prompt: "a cinematic cat",
    imageCount: 1,
  };

  const baseJob: GenerationJob = {
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
    process.env.AGNES_SIZE = "1024x768";
    delete process.env.AGNES_RESPONSE_FORMAT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("should use return_base64 for single text-to-image request", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: null, b64_json: "base64data", revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    const image = await provider.generate(baseRequest, baseJob, 0);

    expect(image.url).toBe("data:image/png;base64,base64data");
    expect(image.status).toBe("completed");

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string);
    expect(body.return_base64).toBe(true);
    expect(body.extra_body).toBeUndefined();
  });

  it("should use extra_body.response_format url for multiple text-to-image requests", async () => {
    const request: CreateGenerationRequest = { ...baseRequest, imageCount: 2 };
    const job: GenerationJob = { ...baseJob, imageCount: 2 };

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

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string);
    expect(body.extra_body.response_format).toBe("url");
    expect(body.return_base64).toBeUndefined();
  });

  it("should use extra_body.response_format b64_json for single image-to-image request", async () => {
    const request: CreateGenerationRequest = {
      ...baseRequest,
      type: "image-to-image",
      inputImage: "https://example.com/input.png",
    };
    const job: GenerationJob = { ...baseJob, type: "image-to-image" };

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

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string);
    expect(body.extra_body.response_format).toBe("b64_json");
    expect(body.extra_body.image).toEqual(["https://example.com/input.png"]);
    expect(body.return_base64).toBeUndefined();
  });

  it("should use extra_body.response_format url for multiple image-to-image requests", async () => {
    const request: CreateGenerationRequest = {
      ...baseRequest,
      type: "image-to-image",
      imageCount: 2,
      inputImage: "data:image/png;base64,xxx",
    };
    const job: GenerationJob = {
      ...baseJob,
      type: "image-to-image",
      imageCount: 2,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: "https://example.com/edited.png", b64_json: null, revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    const image = await provider.generate(request, job, 0);

    expect(image.url).toBe("https://example.com/edited.png");

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string);
    expect(body.extra_body.response_format).toBe("url");
    expect(body.extra_body.image).toEqual(["data:image/png;base64,xxx"]);
  });

  it("should allow explicit returnBase64 override to url", async () => {
    const request: CreateGenerationRequest = {
      ...baseRequest,
      imageCount: 1,
      returnBase64: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: "https://example.com/image.png", b64_json: null, revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    await provider.generate(request, baseJob, 0);

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string);
    expect(body.extra_body.response_format).toBe("url");
    expect(body.return_base64).toBeUndefined();
  });

  it("should allow explicit responseFormat override to url for single text-to-image", async () => {
    const request: CreateGenerationRequest = {
      ...baseRequest,
      imageCount: 1,
      responseFormat: "url",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        created: 1780000000,
        data: [{ url: "https://example.com/image.png", b64_json: null, revised_prompt: null }],
      }),
    });

    const provider = new AgnesProvider();
    const image = await provider.generate(request, baseJob, 0);

    expect(image.url).toBe("https://example.com/image.png");

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(options.body as string);
    expect(body.extra_body.response_format).toBe("url");
    expect(body.return_base64).toBeUndefined();
  });

  it("should throw when API key is missing", async () => {
    delete process.env.IMAGE_GENERATION_API_KEY;
    const provider = new AgnesProvider();
    await expect(provider.generate(baseRequest, baseJob, 0)).rejects.toThrow(ImageGenerationError);
  });

  it("should throw when image-to-image lacks inputImage", async () => {
    const imageToImageRequest: CreateGenerationRequest = {
      ...baseRequest,
      type: "image-to-image",
    };
    const provider = new AgnesProvider();
    await expect(provider.generate(imageToImageRequest, baseJob, 0)).rejects.toThrow(
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
    await expect(provider.generate(baseRequest, baseJob, 0)).rejects.toThrow(ImageGenerationError);
  });

  it("should include fetch cause in network error message", async () => {
    const underlyingError = new Error("connect ETIMEDOUT");
    const fetchError = new Error("fetch failed") as Error & { cause: Error };
    fetchError.cause = underlyingError;
    global.fetch = vi.fn().mockRejectedValue(fetchError);

    const provider = new AgnesProvider();
    await expect(provider.generate(baseRequest, baseJob, 0)).rejects.toThrow(
      "fetch failed: connect ETIMEDOUT",
    );
  });
});
