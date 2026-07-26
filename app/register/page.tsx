"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { BrandMark } from "@/components/brand-mark";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setIsLoading(true);

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const registerResult = (await registerResponse.json()) as {
        success: boolean;
        error?: string;
      };

      if (!registerResult.success) {
        setError(registerResult.error ?? "注册失败");
        setIsLoading(false);
        return;
      }

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const loginResult = (await loginResponse.json()) as {
        success: boolean;
        error?: string;
      };

      if (!loginResult.success) {
        setError("注册成功，但自动登录失败，请手动登录");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("注册失败，请稍后重试");
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
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
          创建账号
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          加入我们，开启 AI 创意之旅
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
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              required
              minLength={3}
              disabled={isLoading}
              className="h-11 rounded-xl border-white/50 bg-white/60 px-4 placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              邮箱
            </label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
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
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
              className="h-11 rounded-xl border-white/50 bg-white/60 px-4 placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              确认密码
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
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
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </form>

      <p className="auth-footer mt-6 text-center text-sm text-muted-foreground">
        已有账号？
        <Link
          href="/login"
          className="ml-1 font-medium text-primary transition-colors hover:text-primary-hover"
        >
          立即登录
        </Link>
      </p>
    </AuthShell>
  );
}
