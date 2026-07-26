import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少 3 个字符")
    .max(32, "用户名最多 32 个字符"),
  email: z.string().email("邮箱格式不正确"),
  password: z
    .string()
    .min(6, "密码至少 6 个字符")
    .max(128, "密码最多 128 个字符"),
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 },
      );
    }

    const { username, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "用户名或邮箱已被注册" },
        { status: 409 },
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message ?? "创建用户失败" },
        { status: 500 },
      );
    }

    await prisma.user.create({
      data: {
        id: authData.user.id,
        username,
        email,
        provider: "email",
      },
    });

    return NextResponse.json(
      { success: true, message: "注册成功" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 },
    );
  }
}
