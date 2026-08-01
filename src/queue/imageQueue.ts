import { Queue } from "bullmq";
import { redis } from "@/lib/redis";
import type { CreateGenerationRequest } from "@/lib/types";

export interface ImageGenerationJobData {
  jobId: string;
  userId: string;
  request: CreateGenerationRequest;
}

export const IMAGE_GENERATION_QUEUE_NAME = "image-generation";

export const imageQueue = new Queue<ImageGenerationJobData>(IMAGE_GENERATION_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400,
    },
    removeOnFail: {
      age: 86400,
    },
  },
});

export async function addImageGenerationJob(
  jobId: string,
  userId: string,
  request: CreateGenerationRequest,
): Promise<void> {
  await imageQueue.add(
    `generate-${jobId}`,
    { jobId, userId, request },
    {
      jobId,
    },
  );
}

export interface QueuePositionInfo {
  position: number;
  estimatedSeconds: number;
}

const AVERAGE_SECONDS_PER_IMAGE = 20;

export async function getQueuePosition(jobId: string): Promise<QueuePositionInfo> {
  const [waiting, delayed, active] = await Promise.all([
    imageQueue.getJobs(["waiting"]),
    imageQueue.getJobs(["delayed"]),
    imageQueue.getJobs(["active"]),
  ]);

  const candidateJobs = [...waiting, ...delayed].sort(
    (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
  );

  const currentIndex = candidateJobs.findIndex((job) => job.id === jobId);

  if (currentIndex === -1) {
    return { position: 0, estimatedSeconds: 0 };
  }

  const aheadJobs = candidateJobs.slice(0, currentIndex);
  const aheadImageCount = aheadJobs.reduce(
    (sum, job) => sum + (job.data.request.imageCount ?? 1),
    0,
  );

  const activeImageCount = active.reduce(
    (sum, job) => sum + (job.data.request.imageCount ?? 1),
    0,
  );

  const estimatedSeconds = (aheadImageCount + activeImageCount) * AVERAGE_SECONDS_PER_IMAGE;

  return {
    position: aheadJobs.length,
    estimatedSeconds,
  };
}
