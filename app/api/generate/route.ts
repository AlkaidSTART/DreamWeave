import { NextResponse } from "next/server";
import { createJob } from "@/lib/job-store";
import type { CreateGenerationRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateGenerationRequest;

    if (!body.type || !["text-to-image", "image-to-image"].includes(body.type)) {
      return NextResponse.json({ error: "无效的任务类型" }, { status: 400 });
    }

    if (body.type === "text-to-image" && !body.prompt?.trim()) {
      return NextResponse.json({ error: "提示词不能为空" }, { status: 400 });
    }

    if (
      typeof body.imageCount !== "number" ||
      body.imageCount < 1 ||
      body.imageCount > 4
    ) {
      return NextResponse.json({ error: "生成数量必须在 1-4 之间" }, { status: 400 });
    }

    const job = createJob(body);

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      message: "任务已提交",
    });
  } catch {
    return NextResponse.json({ error: "请求处理失败" }, { status: 500 });
  }
}
