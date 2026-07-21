import { Worker } from "bullmq";
import { redisConnection } from "@/src/queue/connection";
import { ImageGenerationService } from "@/src/services/ImageGenerationService";
import { jobStorage } from "@/src/services/JobStorageService";
import type { ImageGenerationJobData } from "@/src/queue/imageGenerationQueue";

let worker: Worker<ImageGenerationJobData> | null = null;

function getInitialProgress(index: number, total: number): number {
  return Math.round((index / total) * 100);
}

function getCompletionProgress(index: number, total: number): number {
  return Math.round(((index + 1) / total) * 100);
}

export function startImageGenerationWorker(): Worker<ImageGenerationJobData> {
  if (worker) return worker;

  const service = new ImageGenerationService();

  worker = new Worker<ImageGenerationJobData>(
    "image-generation",
    async (job) => {
      const { jobId, request } = job.data;
      const storedJob = await jobStorage.get(jobId);
      if (!storedJob) {
        throw new Error(`任务 ${jobId} 不存在`);
      }

      await jobStorage.updateStatus(jobId, "processing");

      const total = request.imageCount;

      for (let index = 0; index < total; index += 1) {
        await jobStorage.updateProgress(jobId, getInitialProgress(index, total));

        try {
          const image = await service.generateImage(request, storedJob, index);
          await jobStorage.updateResult(jobId, image);
          await jobStorage.updateProgress(jobId, getCompletionProgress(index, total));
        } catch (error) {
          await jobStorage.updateResult(jobId, {
            id: `img-${index + 1}`,
            url: null,
            status: "failed",
          });
          throw error;
        }
      }

      await jobStorage.updateProgress(jobId, 100);
      await jobStorage.updateStatus(jobId, "completed");

      return { jobId };
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  worker.on("failed", async (job, error) => {
    if (job) {
      await jobStorage.updateStatus(job.data.jobId, "failed", error.message);
    }
  });

  return worker;
}
