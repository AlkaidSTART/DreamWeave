import { NextResponse } from "next/server";
import { getJobById } from "@/lib/job-store";
import type { ApiResponse, GenerationJob } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await getJobById(jobId);

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
}
