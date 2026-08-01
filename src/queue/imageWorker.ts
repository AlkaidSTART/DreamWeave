import { Worker, type Job } from "bullmq";
import { redis } from "@/lib/redis";
import { processGenerationJob } from "@/lib/job-store";
import { IMAGE_GENERATION_QUEUE_NAME, type ImageGenerationJobData } from "./imageQueue";

const LOCK_PREFIX = "gen:active:";
const LOCK_TTL_SECONDS = 300;
const USER_CONCURRENCY_RETRY_DELAY_MS = 3000;
const GLOBAL_WORKER_CONCURRENCY = 2;

function getLockKey(userId: string): string {
  return `${LOCK_PREFIX}${userId}`;
}

async function acquireUserLock(userId: string, jobId: string): Promise<boolean> {
  const lockKey = getLockKey(userId);
  const result = await redis.set(lockKey, jobId, "EX", LOCK_TTL_SECONDS, "NX");
  return result === "OK";
}

async function releaseUserLock(userId: string, jobId: string): Promise<void> {
  const lockKey = getLockKey(userId);
  const releaseScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  await redis.eval(releaseScript, 1, lockKey, jobId);
}

async function extendUserLock(userId: string, jobId: string): Promise<void> {
  const lockKey = getLockKey(userId);
  const extendScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("expire", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;
  await redis.eval(extendScript, 1, lockKey, jobId, String(LOCK_TTL_SECONDS));
}

async function processWithUserLock(job: Job<ImageGenerationJobData>): Promise<void> {
  const { jobId, userId, request } = job.data;

  const acquired = await acquireUserLock(userId, jobId);
  if (!acquired) {
    await job.moveToDelayed(Date.now() + USER_CONCURRENCY_RETRY_DELAY_MS);
    return;
  }

  const lockRefreshInterval = setInterval(() => {
    extendUserLock(userId, jobId).catch((error) => {
      console.error(`[imageWorker] 续期用户锁失败 ${userId}:`, error);
    });
  }, (LOCK_TTL_SECONDS * 1000) / 2);

  try {
    await processGenerationJob(jobId, userId, request);
  } finally {
    clearInterval(lockRefreshInterval);
    await releaseUserLock(userId, jobId);
  }
}

export const imageWorker = new Worker<ImageGenerationJobData>(
  IMAGE_GENERATION_QUEUE_NAME,
  processWithUserLock,
  {
    connection: redis,
    concurrency: GLOBAL_WORKER_CONCURRENCY,
  },
);

imageWorker.on("completed", (job) => {
  console.log(`[imageWorker] job ${job?.id} completed`);
});

imageWorker.on("failed", (job, err) => {
  console.error(`[imageWorker] job ${job?.id} failed: ${err.message}`);
});
