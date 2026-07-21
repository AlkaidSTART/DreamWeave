import { describe, it, expect, beforeEach } from "vitest";
import { JobStorageService } from "@/src/services/JobStorageService";
import type { GenerationJob } from "@/lib/types";

function createMockRedis() {
  const store = new Map<string, Map<string, string>>();

  return {
    hset: async (key: string, values: Record<string, string>) => {
      if (!store.has(key)) store.set(key, new Map());
      const hash = store.get(key)!;
      Object.entries(values).forEach(([field, value]) => hash.set(field, value));
      return 1;
    },
    hget: async (key: string, field: string): Promise<string | null> => {
      return store.get(key)?.get(field) ?? null;
    },
    expire: async () => 1,
    del: async (key: string) => {
      store.delete(key);
      return 1;
    },
  } as unknown as import("ioredis").default;
}

describe("JobStorageService", () => {
  let service: JobStorageService;

  beforeEach(() => {
    service = new JobStorageService(createMockRedis());
  });

  const job: GenerationJob = {
    id: "job-1",
    type: "text-to-image",
    status: "pending",
    prompt: "a cat",
    refinedPrompt: "a cat",
    imageCount: 1,
    results: [{ id: "img-1", url: null, status: "pending" }],
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("should save and retrieve a job", async () => {
    await service.save(job);
    const retrieved = await service.get(job.id);
    expect(retrieved).toEqual(job);
  });

  it("should return null for missing job", async () => {
    const retrieved = await service.get("missing");
    expect(retrieved).toBeNull();
  });

  it("should update job progress", async () => {
    await service.save(job);
    await service.updateProgress(job.id, 50);
    const retrieved = await service.get(job.id);
    expect(retrieved?.progress).toBe(50);
  });

  it("should update job status", async () => {
    await service.save(job);
    await service.updateStatus(job.id, "completed");
    const retrieved = await service.get(job.id);
    expect(retrieved?.status).toBe("completed");
  });

  it("should update result for existing image", async () => {
    await service.save(job);
    await service.updateResult(job.id, {
      id: "img-1",
      url: "https://example.com/image.png",
      status: "completed",
    });
    const retrieved = await service.get(job.id);
    expect(retrieved?.results[0].url).toBe("https://example.com/image.png");
    expect(retrieved?.results[0].status).toBe("completed");
  });

  it("should delete a job", async () => {
    await service.save(job);
    await service.delete(job.id);
    const retrieved = await service.get(job.id);
    expect(retrieved).toBeNull();
  });
});
