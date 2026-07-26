import { createAdminClient } from "@/lib/supabase/admin";

export class ImageStorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ImageStorageError";
  }
}

const BUCKET_NAME = "userbucket";

function buildPath(userId: string, jobId: string, imageId: string): string {
  return `${userId}/${jobId}/${imageId}.png`;
}

export class ImageStorageService {
  async uploadImage(
    userId: string,
    jobId: string,
    imageId: string,
    blob: Blob,
  ): Promise<{ url: string; path: string }> {
    const supabase = createAdminClient();
    const path = buildPath(userId, jobId, imageId);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      throw new ImageStorageError(
        `上传图片到 Supabase Storage 失败: ${error.message}`,
        "STORAGE_UPLOAD_ERROR",
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return {
      url: publicUrlData.publicUrl,
      path,
    };
  }

  async deleteImage(path: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      throw new ImageStorageError(
        `删除 Supabase Storage 图片失败: ${error.message}`,
        "STORAGE_DELETE_ERROR",
      );
    }
  }
}

export const imageStorage = new ImageStorageService();
