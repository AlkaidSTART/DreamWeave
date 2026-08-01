import { NextResponse } from "next/server";
import { z } from "zod";
import { createJob } from "@/lib/job-store";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, GenerationJob } from "@/lib/types";

// 启动图像生成 worker（仅用于副作用）
import "@/src/queue/imageWorker";

const createGenerationSchema = z.object({
  type: z.enum(["text-to-image", "image-to-image"]),
  prompt: z.string().min(1).max(2000),
  imageCount: z.number().int().min(1).max(4),
  skillId: z.string().optional(),
  inputImage: z.string().nullable().optional(),
  model: z.string().optional(),
  size: z.string().optional(),
  ratio: z.enum(["1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"]).optional(),
  quality: z.enum(["1K", "2K", "3K", "4K"]).optional(),
  returnBase64: z.boolean().optional(),
  responseFormat: z.enum(["url", "b64_json"]).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = createGenerationSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("；");
      return NextResponse.json<ApiResponse>(
        { success: false, error: message },
        { status: 400 },
      );
    }

    const job = await createJob(parsed.data, user.id);

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
