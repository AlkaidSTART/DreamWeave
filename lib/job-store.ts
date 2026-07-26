import { ImageGenerationService } from "@/src/services/ImageGenerationService";
import { imageStorage } from "@/src/services/ImageStorageService";
import { jobStorage } from "@/src/services/JobStorageService";
import { promptService } from "@/src/services/PromptService";
import { getSkillTemplate, getSkillType } from "@/src/skills/templates";
import type {
  CreateGenerationRequest,
  GenerationJob,
  GeneratedImage,
} from "@/lib/types";

function buildInitialResults(count: number): GeneratedImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `img-${index + 1}`,
    url: null,
    status: "pending",
  }));
}

function getInitialProgress(index: number, total: number): number {
  return Math.round((index / total) * 100);
}

function getCompletionProgress(index: number, total: number): number {
  return Math.round(((index + 1) / total) * 100);
}

async function urlToBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:")) {
    const response = await fetch(url);
    return response.blob();
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) {
    throw new Error(`下载图片失败: ${response.status}`);
  }
  return response.blob();
}

export async function createJob(
  request: CreateGenerationRequest,
  userId: string,
): Promise<GenerationJob> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const job: GenerationJob = {
    id,
    type: request.type,
    status: "pending",
    prompt: request.prompt,
    refinedPrompt: request.prompt,
    skillId: request.skillId,
    imageCount: request.imageCount,
    ratio: request.ratio,
    quality: request.quality,
    inputImage: request.inputImage ?? undefined,
    results: buildInitialResults(request.imageCount),
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  await jobStorage.save(job, userId);

  const skillTemplate = getSkillTemplate(request.skillId);
  const skillType = getSkillType(request.skillId);
  const refinedPrompt = await promptService.refine(
    request.prompt,
    request.type,
    skillTemplate,
    skillType,
  );
  job.refinedPrompt = refinedPrompt;
  await jobStorage.updatePrompt(id, refinedPrompt);

  const service = new ImageGenerationService();
  const requestWithRefinedPrompt = { ...request, prompt: refinedPrompt };

  await jobStorage.updateStatus(id, "processing");

  for (let index = 0; index < request.imageCount; index += 1) {
    await jobStorage.updateProgress(id, getInitialProgress(index, request.imageCount));

    try {
      const image = await service.generateImage(requestWithRefinedPrompt, job, index);
      const uploaded = await uploadGeneratedImage(image, userId, id);
      await jobStorage.updateResult(id, uploaded.image, uploaded.path);
      await jobStorage.updateProgress(id, getCompletionProgress(index, request.imageCount));
    } catch (error) {
      await jobStorage.updateResult(id, {
        id: `img-${index + 1}`,
        url: null,
        status: "failed",
      });
      const message = error instanceof Error ? error.message : "生成失败";
      await jobStorage.updateStatus(id, "failed", message);
      throw error;
    }
  }

  await jobStorage.updateProgress(id, 100);
  await jobStorage.updateStatus(id, "completed");

  return (await jobStorage.get(id)) as GenerationJob;
}

async function uploadGeneratedImage(
  image: GeneratedImage,
  userId: string,
  jobId: string,
): Promise<{ image: GeneratedImage; path?: string }> {
  if (!image.url) {
    return { image };
  }

  const blob = await urlToBlob(image.url);
  const { url, path } = await imageStorage.uploadImage(userId, jobId, image.id, blob);

  return {
    image: { ...image, url },
    path,
  };
}

export async function getJobById(jobId: string): Promise<GenerationJob | undefined> {
  const job = await jobStorage.get(jobId);
  return job ?? undefined;
}

export async function getJobByIdAndUser(
  jobId: string,
  userId: string,
): Promise<GenerationJob | undefined> {
  const job = await jobStorage.getByIdAndUser(jobId, userId);
  return job ?? undefined;
}

export async function updateJobProgress(id: string, progress: number): Promise<void> {
  await jobStorage.updateProgress(id, progress);
}

export async function listJobsByUser(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<GenerationJob[]> {
  return jobStorage.list(userId, limit, offset);
}
