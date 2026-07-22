import type {
  ApiResponse,
  CreateGenerationRequest,
  GenerationJob,
  Skill,
  UploadImageResponse,
} from "@/lib/types";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `请求失败：${response.status}`);
  }
  const result = (await response.json()) as ApiResponse<T>;
  if (!result.success) {
    throw new Error(result.error || "请求失败");
  }
  if (result.data === undefined) {
    throw new Error("响应中缺少数据");
  }
  return result.data;
}

export async function createGeneration(request: CreateGenerationRequest): Promise<GenerationJob> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<GenerationJob>(response);
}

export async function getJob(jobId: string, baseUrl?: string): Promise<GenerationJob> {
  const response = await fetch(`${baseUrl ?? ""}${API_BASE}/jobs/${jobId}`);
  return handleResponse<GenerationJob>(response);
}

export async function fetchSkills(): Promise<Skill[]> {
  const response = await fetch(`${API_BASE}/skills`);
  const data = await handleResponse<{ skills: Skill[] }>(response);
  return data.skills;
}

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<UploadImageResponse>(response);
}

interface ProgressEventData {
  progress: number;
  status?: string;
  results?: GenerationJob["results"];
  error?: string;
}

export interface JobProgressHandlers {
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: string) => void;
  onResult?: (result: GenerationJob["results"][number]) => void;
  onComplete?: (job: GenerationJob) => void;
  onError?: (error: string) => void;
}

export function subscribeJobProgress(
  jobId: string,
  handlers: JobProgressHandlers,
): () => void {
  const source = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);

  source.addEventListener("progress", (event) => {
    const data = JSON.parse((event as MessageEvent).data) as ProgressEventData;
    handlers.onProgress?.(data.progress);
    if (data.status) handlers.onStatusChange?.(data.status);
    data.results?.forEach((result) => handlers.onResult?.(result));
  });

  source.addEventListener("complete", (event) => {
    const data = JSON.parse((event as MessageEvent).data) as GenerationJob;
    handlers.onComplete?.(data);
    source.close();
  });

  source.addEventListener("error", (event) => {
    const data = JSON.parse((event as MessageEvent).data) as ProgressEventData;
    handlers.onError?.(data.error || "生成任务异常");
    source.close();
  });

  source.onerror = () => {
    handlers.onError?.("SSE 连接异常");
    source.close();
  };

  return () => source.close();
}
