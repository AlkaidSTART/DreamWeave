import { NextResponse } from "next/server";
import { z } from "zod";
import { promptService } from "@/src/services/PromptService";
import { getSkillTemplate } from "@/src/skills/templates";
import type { ApiResponse } from "@/lib/types";

const refineSchema = z.object({
  prompt: z.string().min(1).max(2000),
  type: z.enum(["text-to-image", "image-to-image"]),
  skillId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = refineSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("；");
      return NextResponse.json<ApiResponse>(
        { success: false, error: message },
        { status: 400 },
      );
    }

    const { prompt, type, skillId } = parsed.data;
    const skillTemplate = getSkillTemplate(skillId);
    const refinedPrompt = await promptService.refine(prompt, type, skillTemplate);

    const response: ApiResponse<{ refinedPrompt: string }> = {
      success: true,
      data: { refinedPrompt },
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "润色失败";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
