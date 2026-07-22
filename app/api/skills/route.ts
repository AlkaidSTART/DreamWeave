import { NextResponse } from "next/server";
import { skills } from "@/src/skills/templates";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  const response: ApiResponse<{ skills: typeof skills }> = {
    success: true,
    data: { skills },
  };

  return NextResponse.json(response);
}
