import { describe, it, expect } from "vitest";
import {
  ImageGenerationService,
  ImageGenerationError,
} from "@/src/services/ImageGenerationService";
import type { CreateGenerationRequest, GenerationJob } from "@/lib/types";

describe("ImageGenerationService", () => {
  const request: CreateGenerationRequest = {
    type: "text-to-image",
    prompt: "a cute cat",
    imageCount: 1,
  };

  const job: GenerationJob = {
    id: "test-job-id",
    type: "text-to-image",
    status: "processing",
    prompt: "a cute cat",
    refinedPrompt: "a cute cat",
    imageCount: 1,
    results: [{ id: "img-1", url: null, status: "pending" }],
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("should generate image using custom provider", async () => {
    const service = new ImageGenerationService({
      async generate() {
        return {
          id: "img-1",
          url: "https://example.com/image.png",
          width: 1024,
          height: 1024,
          status: "completed",
        };
      },
    });

    const image = await service.generateImage(request, job, 0);

    expect(image.status).toBe("completed");
    expect(image.url).toBe("https://example.com/image.png");
  });

  it("should propagate provider errors as ImageGenerationError", async () => {
    const service = new ImageGenerationService({
      async generate() {
        throw new ImageGenerationError("provider failed", "PROVIDER_ERROR");
      },
    });

    await expect(service.generateImage(request, job, 0)).rejects.toThrow(
      ImageGenerationError,
    );
  });
});
