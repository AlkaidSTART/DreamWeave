import { Queue } from "bullmq";
import { redisConnection } from "@/src/queue/connection";
import type { CreateGenerationRequest } from "@/lib/types";

export interface ImageGenerationJobData {
  jobId: string;
  request: CreateGenerationRequest;
}

export const imageGenerationQueue = new Queue<ImageGenerationJobData>("image-generation", {
  connection: redisConnection,
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
