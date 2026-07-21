import { Worker } from "bullmq";
import { getRedisConnection } from "@/src/queue/connection";
import { ImageGenerationService } from "@/src/services/ImageGenerationService";
import { jobStorage } from "@/src/services/JobStorageService";
import { promptService } from "@/src/services/PromptService";
import { getSkillTemplate } from "@/src/skills/templates";
import type { ImageGenerationJobData } from "@/src/queue/imageGenerationQueue";
import type { CreateGenerationRequest } from "@/lib/types";

let worker: Worker<ImageGenerationJobData> | null = null;

function getInitialProgress(index: number, total: number): number {
  return Math.round((index / total) * 100);
}

function getCompletionProgress(index: number, total: number): number {
  return Math.round(((index + 1) / total) * 100);
}

async function refinePrompt(
  jobId: string,
  request: CreateGenerationRequest,
): Promise<{ refinedPrompt: string; requestWithRefinedPrompt: CreateGenerationRequest }> {
  const skillTemplate = getSkillTemplate(request.skillId);
  const refinedPrompt = await promptService.refine(request.prompt, request.type, skillTemplate);

  await jobStorage.updatePrompt(jobId, refinedPrompt);

  return {
    refinedPrompt,
    requestWithRefinedPrompt: { ...request, prompt: refinedPrompt },
  };
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

      const { refinedPrompt, requestWithRefinedPrompt } = await refinePrompt(jobId, request);
      storedJob.refinedPrompt = refinedPrompt;

      const total = request.imageCount;

      for (let index = 0; index < total; index += 1) {
        await jobStorage.updateProgress(jobId, getInitialProgress(index, total));

        try {
          const image = await service.generateImage(requestWithRefinedPrompt, storedJob, index);
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
      connection: getRedisConnection(),
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
