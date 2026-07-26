import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 home-liquid-bg" />
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white/30 backdrop-blur-2xl dark:bg-white/5" />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
