import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少 3 个字符")
    .max(32, "用户名最多 32 个字符"),
  password: z
    .string()
    .min(6, "密码至少 6 个字符")
    .max(128, "密码最多 128 个字符"),
  email: z.string().email("邮箱格式不正确").optional(),
});

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

    const { username, password, email } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, ...(email ? [{ email }] : [])],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "用户名或邮箱已被注册" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        provider: "credentials",
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
