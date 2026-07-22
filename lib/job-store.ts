import { ImageGenerationService } from "@/src/services/ImageGenerationService";
import { jobStorage } from "@/src/services/JobStorageService";
import { promptService } from "@/src/services/PromptService";
import { getSkillTemplate } from "@/src/skills/templates";
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

export async function createJob(request: CreateGenerationRequest): Promise<GenerationJob> {
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
    inputImage: request.inputImage ?? undefined,
    results: buildInitialResults(request.imageCount),
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  await jobStorage.save(job);

  const skillTemplate = getSkillTemplate(request.skillId);
  const refinedPrompt = await promptService.refine(request.prompt, request.type, skillTemplate);
  job.refinedPrompt = refinedPrompt;
  await jobStorage.updatePrompt(id, refinedPrompt);

  const service = new ImageGenerationService();
  const requestWithRefinedPrompt = { ...request, prompt: refinedPrompt };

  await jobStorage.updateStatus(id, "processing");

  for (let index = 0; index < request.imageCount; index += 1) {
    await jobStorage.updateProgress(id, getInitialProgress(index, request.imageCount));

    try {
      const image = await service.generateImage(requestWithRefinedPrompt, job, index);
      await jobStorage.updateResult(id, image);
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

  return jobStorage.get(id) as Promise<GenerationJob>;
}

export async function getJobById(id: string): Promise<GenerationJob | undefined> {
  const job = await jobStorage.get(id);
  return job ?? undefined;
}

export async function updateJobProgress(id: string, progress: number): Promise<void> {
  await jobStorage.updateProgress(id, progress);
}

export async function listJobs(limit = 50, offset = 0): Promise<GenerationJob[]> {
  return jobStorage.list(limit, offset);
}
