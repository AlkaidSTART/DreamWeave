export type GenerationType = "text-to-image" | "image-to-image";

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
}

export interface CreateGenerationResponse {
  jobId: string;
  status: JobStatus;
  message: string;
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
