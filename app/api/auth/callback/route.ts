import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const { user } = data;
  const email = user.email;
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const image = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const username = email.split("@")[0]?.slice(0, 32) ?? user.id;
      await prisma.user.create({
        data: {
          id: user.id,
          username,
          email,
          name: typeof name === "string" ? name : null,
          image: typeof image === "string" ? image : null,
          provider: "github",
        },
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
