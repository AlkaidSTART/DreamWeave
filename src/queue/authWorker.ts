import { Worker } from "bullmq";
import { redis } from "@/lib/redis";

interface AuthJobData {
  userId: string;
  event: "register" | "login";
}

const processor = async (job: { data: AuthJobData }) => {
  const { userId, event } = job.data;
  // 预留：发送欢迎邮件、记录登录日志等
  console.log(`[authWorker] ${event} event for user ${userId}`);
};

export const authWorker = new Worker<AuthJobData>("auth", processor, {
  connection: redis,
  concurrency: 4,
});

authWorker.on("completed", (job) => {
  console.log(`[authWorker] job ${job.id} completed`);
});

authWorker.on("failed", (job, err) => {
  console.error(`[authWorker] job ${job?.id} failed: ${err.message}`);
});
