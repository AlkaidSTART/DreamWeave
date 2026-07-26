import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { JobStorageService } from "@/src/services/JobStorageService";
import { prisma } from "@/lib/prisma";
import type { GenerationJob } from "@/lib/types";

const USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const JOB_ID_1 = "11111111-2222-3333-4444-555555555555";
const JOB_ID_2 = "22222222-3333-4444-5555-666666666666";

describe("JobStorageService", () => {
  let service: JobStorageService;

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: USER_ID },
      create: {
        id: USER_ID,
        username: "test-user",
        email: "test@example.com",
      },
      update: {},
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: USER_ID },
    });
  });

  beforeEach(async () => {
    service = new JobStorageService();
    await prisma.generationJob.deleteMany({
      where: { userId: USER_ID },
    });
  });

  const createJob = (id: string): GenerationJob => ({
    id,
    type: "text-to-image",
    status: "pending",
    prompt: "a cat",
    refinedPrompt: "a cat",
    imageCount: 1,
    skillId: undefined,
    ratio: undefined,
    quality: undefined,
    inputImage: undefined,
    error: undefined,
    results: [{ id: "img-1", url: null, status: "pending", width: undefined, height: undefined }],
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it("should save and retrieve a job", async () => {
    const job = createJob(JOB_ID_1);
    await service.save(job, USER_ID);
    const retrieved = await service.get(job.id);
    expect(retrieved).toEqual(job);
  });

  it("should return null for missing job", async () => {
    const retrieved = await service.get("00000000-0000-0000-0000-000000000000");
    expect(retrieved).toBeNull();
  });

  it("should update job progress", async () => {
    const job = createJob(JOB_ID_1);
    await service.save(job, USER_ID);
    await service.updateProgress(job.id, 50);
    const retrieved = await service.get(job.id);
    expect(retrieved?.progress).toBe(50);
  });

  it("should update job status", async () => {
    const job = createJob(JOB_ID_1);
    await service.save(job, USER_ID);
    await service.updateStatus(job.id, "completed");
    const retrieved = await service.get(job.id);
    expect(retrieved?.status).toBe("completed");
  });

  it("should update result for existing image", async () => {
    const job = createJob(JOB_ID_1);
    await service.save(job, USER_ID);
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
    const job = createJob(JOB_ID_1);
    await service.save(job, USER_ID);
    await service.updatePrompt(job.id, "refined prompt");
    const retrieved = await service.get(job.id);
    expect(retrieved?.refinedPrompt).toBe("refined prompt");
  });

  it("should delete a job", async () => {
    const job = createJob(JOB_ID_1);
    await service.save(job, USER_ID);
    await service.delete(job.id);
    const retrieved = await service.get(job.id);
    expect(retrieved).toBeNull();
  });

  it("should list jobs in descending order", { timeout: 15000 }, async () => {
    const job1 = createJob(JOB_ID_1);
    const job2 = { ...createJob(JOB_ID_2), createdAt: new Date(Date.now() + 1000).toISOString() };
    await service.save(job1, USER_ID);
    await service.save(job2, USER_ID);
    const list = await service.list(USER_ID);
    expect(list.map((item) => item.id)).toEqual([JOB_ID_2, JOB_ID_1]);
  });
});
