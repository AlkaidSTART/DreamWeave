import { NextResponse } from "next/server";
import { getJobByIdAndUser } from "@/lib/job-store";
import { createClient } from "@/lib/supabase/server";
import { imageStorage } from "@/src/services/ImageStorageService";
import { jobStorage } from "@/src/services/JobStorageService";
import type { ApiResponse, GenerationJob } from "@/lib/types";

async function getCurrentUser(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }

    const { jobId } = await params;
    const job = await getJobByIdAndUser(jobId, userId);

    if (!job) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "任务不存在" },
        { status: 404 },
      );
    }

    const response: ApiResponse<GenerationJob> = {
      success: true,
      data: job,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求处理失败";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }

    const { jobId } = await params;
    const job = await getJobByIdAndUser(jobId, userId);

    if (!job) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "任务不存在" },
        { status: 404 },
      );
    }

    const storagePaths = await jobStorage.getStoragePaths(jobId);
    await Promise.all(storagePaths.map((path) => imageStorage.deleteImage(path)));
    await jobStorage.delete(jobId);

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求处理失败";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
