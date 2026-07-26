import { Redis } from "ioredis";

function createRedisConnection(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("缺少 REDIS_URL 环境变量");
  }

  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export const redis = createRedisConnection();
