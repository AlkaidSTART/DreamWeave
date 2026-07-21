import IORedis from "ioredis";

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection || redisConnection.status === "end") {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redisConnection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return redisConnection;
}

export function createRedisConnection(): IORedis {
  return getRedisConnection();
}
