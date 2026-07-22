import { describe, it, expect, beforeEach } from "vitest";
import { JobStorageService } from "@/src/services/JobStorageService";
import type { GenerationJob } from "@/lib/types";

describe("JobStorageService", () => {
  let service: JobStorageService;

  beforeEach(() => {
    service = new JobStorageService();
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

  it("should update refined prompt", async () => {
    await service.save(job);
    await service.updatePrompt(job.id, "refined prompt");
    const retrieved = await service.get(job.id);
    expect(retrieved?.refinedPrompt).toBe("refined prompt");
  });

  it("should delete a job", async () => {
    await service.save(job);
    await service.delete(job.id);
    const retrieved = await service.get(job.id);
    expect(retrieved).toBeNull();
  });

  it("should list jobs in descending order", async () => {
    const job2: GenerationJob = { ...job, id: "job-2", createdAt: new Date(Date.now() + 1000).toISOString() };
    await service.save(job);
    await service.save(job2);
    const list = await service.list();
    expect(list.map((item) => item.id)).toEqual(["job-2", "job-1"]);
  });
});
