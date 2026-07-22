export type GenerationType = "text-to-image" | "image-to-image";

export type ImageRatio =
  | "1:1"
  | "3:4"
  | "4:3"
  | "16:9"
  | "9:16"
  | "2:3"
  | "3:2"
  | "21:9";

export type ImageQuality = "1K" | "2K" | "3K" | "4K";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type ImageStatus = "pending" | "completed" | "failed";

export interface GeneratedImage {
  id: string;
  url: string | null;
  width?: number;
  height?: number;
  status: ImageStatus;
}

export interface GenerationJob {
  id: string;
  type: GenerationType;
  status: JobStatus;
  prompt: string;
  refinedPrompt: string;
  skillId?: string;
  imageCount: number;
  ratio?: ImageRatio;
  quality?: ImageQuality;
  inputImage?: string;
  results: GeneratedImage[];
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
  previewUrl?: string;
  isDefault: boolean;
}

export interface CreateGenerationRequest {
  type: GenerationType;
  prompt: string;
  imageCount: number;
  skillId?: string;
  inputImage?: string | null;
  // Agnes AI 参数，未传时使用环境变量默认值
  model?: string;
  size?: string;
  ratio?: ImageRatio;
  quality?: ImageQuality;
  returnBase64?: boolean;
  responseFormat?: "url" | "b64_json";
}

export interface UploadImageResponse {
  url: string;
  width: number;
  height: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StoredImage extends GeneratedImage {
  jobId: string;
  blob?: Blob;
  objectUrl?: string;
}

export interface StoredJob extends Omit<GenerationJob, "results"> {
  results: StoredImage[];
}
