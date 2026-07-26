import { prisma } from "@/lib/prisma";
import type { GenerationJob, JobStatus, GeneratedImage } from "@/lib/types";

export class JobStorageService {
  async save(job: GenerationJob, userId: string): Promise<void> {
    await prisma.generationJob.upsert({
      where: { id: job.id },
      create: {
        id: job.id,
        userId,
        type: job.type,
        status: job.status,
        prompt: job.prompt,
        refinedPrompt: job.refinedPrompt,
        skillId: job.skillId,
        imageCount: job.imageCount,
        ratio: job.ratio,
        quality: job.quality,
        inputImage: job.inputImage,
        progress: job.progress,
        error: job.error,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
        results: {
          create: job.results.map((result) => ({
            imageId: result.id,
            url: result.url,
            width: result.width,
            height: result.height,
            status: result.status,
          })),
        },
      },
      update: {
        status: job.status,
        prompt: job.prompt,
        refinedPrompt: job.refinedPrompt,
        skillId: job.skillId,
        imageCount: job.imageCount,
        ratio: job.ratio,
        quality: job.quality,
        inputImage: job.inputImage,
        progress: job.progress,
        error: job.error,
        updatedAt: new Date(job.updatedAt),
        results: {
          deleteMany: {},
          create: job.results.map((result) => ({
            imageId: result.id,
            url: result.url,
            width: result.width,
            height: result.height,
            status: result.status,
          })),
        },
      },
    });
  }

  async get(jobId: string): Promise<GenerationJob | null> {
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: { results: true },
    });

    return job ? this.mapToGenerationJob(job) : null;
  }

  async getByIdAndUser(jobId: string, userId: string): Promise<GenerationJob | null> {
    const job = await prisma.generationJob.findFirst({
      where: { id: jobId, userId },
      include: { results: true },
    });

    return job ? this.mapToGenerationJob(job) : null;
  }

  async updateStatus(
    jobId: string,
    status: JobStatus,
    error?: string,
  ): Promise<void> {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status,
        error,
        updatedAt: new Date(),
      },
    });
  }

  async updateProgress(jobId: string, progress: number): Promise<void> {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        progress,
        updatedAt: new Date(),
      },
    });
  }

  async updateResult(
    jobId: string,
    result: GeneratedImage,
    storagePath?: string,
  ): Promise<void> {
    await prisma.generationResult.upsert({
      where: {
        jobId_imageId: {
          jobId,
          imageId: result.id,
        },
      },
      create: {
        jobId,
        imageId: result.id,
        url: result.url,
        width: result.width,
        height: result.height,
        status: result.status,
        storagePath,
      },
      update: {
        url: result.url,
        width: result.width,
        height: result.height,
        status: result.status,
        storagePath,
      },
    });

    await prisma.generationJob.update({
      where: { id: jobId },
      data: { updatedAt: new Date() },
    });
  }

  async updatePrompt(jobId: string, refinedPrompt: string): Promise<void> {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        refinedPrompt,
        updatedAt: new Date(),
      },
    });
  }

  async delete(jobId: string): Promise<void> {
    await prisma.generationJob.delete({
      where: { id: jobId },
    });
  }

  async getStoragePaths(jobId: string): Promise<string[]> {
    const results = await prisma.generationResult.findMany({
      where: { jobId },
      select: { storagePath: true },
    });

    return results
      .map((result) => result.storagePath)
      .filter((path): path is string => Boolean(path));
  }

  async list(userId: string, limit = 50, offset = 0): Promise<GenerationJob[]> {
    const jobs = await prisma.generationJob.findMany({
      where: { userId },
      include: { results: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return jobs.map((job) => this.mapToGenerationJob(job));
  }

  private mapToGenerationJob(
    job: Awaited<ReturnType<typeof prisma.generationJob.findUnique>> & {
      results?: { id: string; imageId: string; url: string | null; width: number | null; height: number | null; status: string }[];
    },
  ): GenerationJob {
    return {
      id: job.id,
      type: job.type as GenerationJob["type"],
      status: job.status as GenerationJob["status"],
      prompt: job.prompt,
      refinedPrompt: job.refinedPrompt,
      skillId: job.skillId ?? undefined,
      imageCount: job.imageCount,
      ratio: (job.ratio ?? undefined) as GenerationJob["ratio"],
      quality: (job.quality ?? undefined) as GenerationJob["quality"],
      inputImage: job.inputImage ?? undefined,
      progress: job.progress,
      error: job.error ?? undefined,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      results:
        job.results?.map((result) => ({
          id: result.imageId,
          url: result.url,
          width: result.width ?? undefined,
          height: result.height ?? undefined,
          status: result.status as GeneratedImage["status"],
        })) ?? [],
    };
  }
}

export const jobStorage = new JobStorageService();
