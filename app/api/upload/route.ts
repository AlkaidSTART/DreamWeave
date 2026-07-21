import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件格式" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "文件大小超过 10MB" }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase() || ".png";
    const fileName = `${crypto.randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, fileName), Buffer.from(arrayBuffer));

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      width: 0,
      height: 0,
    });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
