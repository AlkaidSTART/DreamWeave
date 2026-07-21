import type IORedis from "ioredis";
import { getRedisConnection } from "@/src/queue/connection";
import type { GenerationJob, JobStatus } from "@/lib/types";

const JOB_KEY_PREFIX = "dreamweave:job:";
const JOB_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export class JobStorageService {
  constructor(private readonly connection: IORedis) {}

  private getKey(jobId: string): string {
    return `${JOB_KEY_PREFIX}${jobId}`;
  }

  async save(job: GenerationJob): Promise<void> {
    await this.connection.hset(this.getKey(job.id), {
      data: JSON.stringify(job),
    });
    await this.connection.expire(this.getKey(job.id), JOB_TTL_SECONDS);
  }

  async get(jobId: string): Promise<GenerationJob | null> {
    const record = await this.connection.hget(this.getKey(jobId), "data");
    if (!record) return null;
    try {
      return JSON.parse(record) as GenerationJob;
    } catch {
      return null;
    }
  }

  async updateStatus(jobId: string, status: JobStatus, error?: string): Promise<void> {
    const job = await this.get(jobId);
    if (!job) return;
    job.status = status;
    job.updatedAt = new Date().toISOString();
    if (error) job.error = error;
    await this.save(job);
  }

  async updateProgress(jobId: string, progress: number): Promise<void> {
    const job = await this.get(jobId);
    if (!job) return;
    job.progress = progress;
    job.updatedAt = new Date().toISOString();
    await this.save(job);
  }

  async updateResult(jobId: string, result: GenerationJob["results"][number]): Promise<void> {
    const job = await this.get(jobId);
    if (!job) return;
    const index = job.results.findIndex((item) => item.id === result.id);
    if (index >= 0) {
      job.results[index] = result;
    } else {
      job.results.push(result);
    }
    job.updatedAt = new Date().toISOString();
    await this.save(job);
  }

  async delete(jobId: string): Promise<void> {
    await this.connection.del(this.getKey(jobId));
  }
}

export const jobStorage = new JobStorageService(getRedisConnection());
