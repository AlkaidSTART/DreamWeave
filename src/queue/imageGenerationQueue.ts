import { Queue } from "bullmq";
import { getRedisConnection } from "@/src/queue/connection";
import type { CreateGenerationRequest } from "@/lib/types";

export interface ImageGenerationJobData {
  jobId: string;
  request: CreateGenerationRequest;
}

let queue: Queue<ImageGenerationJobData> | null = null;

export function getImageGenerationQueue(): Queue<ImageGenerationJobData> {
  if (!queue) {
    queue = new Queue<ImageGenerationJobData>("image-generation", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: { age: 3600, count: 100 },
        removeOnFail: { age: 3600, count: 100 },
      },
    });
  }
  return queue;
}
