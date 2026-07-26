import { NextResponse } from "next/server";
import { listJobsByUser } from "@/lib/job-store";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, GenerationJob } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "50");
    const offset = Number(searchParams.get("offset") ?? "0");

    const jobs = await listJobsByUser(user.id, limit, offset);

    const response: ApiResponse<GenerationJob[]> = {
      success: true,
      data: jobs,
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
