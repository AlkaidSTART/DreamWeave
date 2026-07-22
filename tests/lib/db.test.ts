import { describe, it, expect, beforeEach } from "vitest";
import { saveJob, getJobFromDB, saveImage, getImagesByJobId } from "@/lib/db";
import type { GenerationJob } from "@/lib/types";

describe("IndexedDB storage", () => {
  const job: GenerationJob = {
    id: "job-1",
    type: "text-to-image",
    status: "completed",
    prompt: "a cat",
    refinedPrompt: "a cat",
    imageCount: 1,
    results: [{ id: "img-1", url: "https://example.com/image.png", status: "completed" }],
    progress: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const stored = await getJobFromDB(job.id);
    if (stored) {
      const request = indexedDB.deleteDatabase("dreamweave");
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  });

  it("should save and retrieve a job", async () => {
    await saveJob(job);
    const retrieved = await getJobFromDB(job.id);
    expect(retrieved?.id).toBe(job.id);
    expect(retrieved?.status).toBe("completed");
  });

  it("should save and retrieve an image blob", async () => {
    await saveJob(job);
    const blob = new Blob(["image-data"], { type: "image/png" });
    await saveImage(job.id, "img-1", blob, {
      url: "https://example.com/image.png",
      width: 1024,
      height: 1024,
      status: "completed",
    });

    const images = await getImagesByJobId(job.id);
    expect(images).toHaveLength(1);
    expect(images[0].id).toBe("img-1");
    expect(images[0].blob).toBeTruthy();
    expect(images[0].objectUrl).toBeDefined();
  });
});
