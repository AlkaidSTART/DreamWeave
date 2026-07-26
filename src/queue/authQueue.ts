import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const authQueue = new Queue("auth", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 86400,
    },
    removeOnFail: {
      age: 86400,
    },
  },
});
