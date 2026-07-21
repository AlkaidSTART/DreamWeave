import { getImageGenerationQueue } from "@/src/queue/imageGenerationQueue";
import { startImageGenerationWorker } from "@/src/queue/worker";
import { jobStorage } from "@/src/services/JobStorageService";
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

export async function createJob(request: CreateGenerationRequest): Promise<GenerationJob> {
  startImageGenerationWorker();

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

  const queue = getImageGenerationQueue();
  await queue.add("generate", { jobId: id, request }, { jobId: id });

  return job;
}

export async function getJobById(id: string): Promise<GenerationJob | undefined> {
  const job = await jobStorage.get(id);
  return job ?? undefined;
}

export async function updateJobProgress(id: string, progress: number): Promise<void> {
  await jobStorage.updateProgress(id, progress);
}
