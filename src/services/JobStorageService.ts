import type { GenerationJob, JobStatus } from "@/lib/types";

export class JobStorageService {
  private readonly jobs = new Map<string, GenerationJob>();

  async save(job: GenerationJob): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async get(jobId: string): Promise<GenerationJob | null> {
    const job = this.jobs.get(jobId);
    return job ? { ...job } : null;
  }

  async updateStatus(jobId: string, status: JobStatus, error?: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = status;
    job.updatedAt = new Date().toISOString();
    if (error) job.error = error;
  }

  async updateProgress(jobId: string, progress: number): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.progress = progress;
    job.updatedAt = new Date().toISOString();
  }

  async updateResult(jobId: string, result: GenerationJob["results"][number]): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    const index = job.results.findIndex((item) => item.id === result.id);
    if (index >= 0) {
      job.results[index] = result;
    } else {
      job.results.push(result);
    }
    job.updatedAt = new Date().toISOString();
  }

  async updatePrompt(jobId: string, refinedPrompt: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.refinedPrompt = refinedPrompt;
    job.updatedAt = new Date().toISOString();
  }

  async delete(jobId: string): Promise<void> {
    this.jobs.delete(jobId);
  }

  async list(limit = 50, offset = 0): Promise<GenerationJob[]> {
    const allJobs = Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allJobs.slice(offset, offset + limit);
  }
}

export const jobStorage = new JobStorageService();
