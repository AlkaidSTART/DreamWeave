import type {
  CreateGenerationRequest,
  GenerationJob,
  GeneratedImage,
} from "@/lib/types";

const jobs = new Map<string, GenerationJob>();

function getPlaceholderUrl(jobId: string, index: number) {
  return `https://picsum.photos/seed/${jobId}-${index}/1024/1024`;
}

export function createJob(request: CreateGenerationRequest): GenerationJob {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const results: GeneratedImage[] = Array.from(
    { length: request.imageCount },
    (_, index) => ({
      id: `img-${index + 1}`,
      url: null,
      status: "pending",
    }),
  );

  const job: GenerationJob = {
    id,
    type: request.type,
    status: "pending",
    prompt: request.prompt,
    refinedPrompt: request.prompt,
    skillId: request.skillId,
    imageCount: request.imageCount,
    inputImage: request.inputImage ?? undefined,
    results,
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(id, job);
  startProcessing(job);
  return job;
}

export function getJobById(id: string): GenerationJob | undefined {
  return jobs.get(id);
}

function startProcessing(job: GenerationJob) {
  job.status = "processing";
  job.updatedAt = new Date().toISOString();

  const totalSteps = 20;
  let step = 0;

  const interval = setInterval(() => {
    step += 1;
    job.progress = Math.min(100, Math.round((step / totalSteps) * 100));
    job.updatedAt = new Date().toISOString();

    const completedIndex = Math.floor((step / totalSteps) * job.imageCount);
    for (let i = 0; i < job.imageCount; i += 1) {
      if (i < completedIndex && job.results[i].status === "pending") {
        job.results[i] = {
          ...job.results[i],
          url: getPlaceholderUrl(job.id, i),
          status: "completed",
        };
      }
    }

    if (step >= totalSteps) {
      clearInterval(interval);
      job.status = "completed";
      job.progress = 100;
      job.results.forEach((result, index) => {
        if (result.status === "pending") {
          result.url = getPlaceholderUrl(job.id, index);
          result.status = "completed";
        }
      });
      job.updatedAt = new Date().toISOString();
    }
  }, 500);
}
