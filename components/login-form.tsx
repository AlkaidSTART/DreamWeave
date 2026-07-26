"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!result.success) {
        setError(result.error ?? "登录失败");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("登录失败，请稍后重试");
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
      },
    });
  };

  return (
    <>
      <div className="auth-brand mb-8 flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-4 flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-85"
        >
          <BrandMark className="h-10 w-10" />
          <span className="font-logo text-2xl font-semibold tracking-[0.01em]">
            Dreamweave
          </span>
        </Link>
        <h1 className="auth-title text-2xl font-semibold tracking-tight text-foreground">
          欢迎回来
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          登录以继续您的创意旅程
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-foreground"
          >
            用户名
          </label>
          <Input
            id="username"
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="h-11 rounded-xl border-white/50 bg-white/60 px-4 placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            密码
          </label>
          <Input
            id="password"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-11 rounded-xl border-white/50 bg-white/60 px-4 placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary-hover hover:shadow-lg active:bg-primary-active"
        >
          {isLoading ? "登录中..." : "登录"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">或通过以下方式登录</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={isLoading}
        onClick={handleGitHubSignIn}
        className="h-11 w-full rounded-xl"
        leftIcon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
          </svg>
        }
      >
        GitHub
      </Button>

      <p className="auth-footer mt-6 text-center text-sm text-muted-foreground">
        还没有账号？
        <Link
          href="/register"
          className="ml-1 font-medium text-primary transition-colors hover:text-primary-hover"
        >
          立即注册
        </Link>
      </p>
    </>
  );
}
