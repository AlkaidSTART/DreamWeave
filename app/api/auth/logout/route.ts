import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true, message: "已退出登录" });
  } catch {
    return NextResponse.json(
      { success: false, error: "退出失败" },
      { status: 500 },
    );
  }
}
