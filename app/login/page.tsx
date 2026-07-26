import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white/30 backdrop-blur-2xl dark:bg-white/5" />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
