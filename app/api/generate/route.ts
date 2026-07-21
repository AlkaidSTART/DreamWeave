import { NextResponse } from "next/server";
import { z } from "zod";
import { createJob } from "@/lib/job-store";
import type { ApiResponse, CreateGenerationResponse } from "@/lib/types";

const createGenerationSchema = z.object({
  type: z.enum(["text-to-image", "image-to-image"]),
  prompt: z.string().min(1).max(2000),
  imageCount: z.number().int().min(1).max(4),
  skillId: z.string().optional(),
  inputImage: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createGenerationSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("；");
      return NextResponse.json<ApiResponse>(
        { success: false, error: message },
        { status: 400 },
      );
    }

    const job = await createJob(parsed.data);

    const response: ApiResponse<CreateGenerationResponse> = {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        message: "任务已提交",
      },
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
