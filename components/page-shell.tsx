import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title?: string;
  description?: string;
  backHref?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  title,
  description,
  backHref,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <Toaster />
      <main className={cn("flex-1", className)}>
        {(title || description) && (
          <div className="mx-auto max-w-3xl px-4 pb-6 pt-10 md:px-6 lg:px-8">
            {backHref && (
              <Link
                href={backHref}
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </Link>
            )}
            {title && (
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-base text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
