"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "主页" },
  { href: "/text-to-image", label: "文生图" },
  { href: "/image-to-image", label: "图生图" },
  { href: "/gallery", label: "图库" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-white/20 bg-white/45 shadow-[0_4px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/35 dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-logo text-xl font-semibold tracking-tight">
            Dreamweave
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/20 bg-white/40 px-1.5 py-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                  isActive
                    ? "border border-primary/25 bg-primary/10 text-primary shadow-[0_2px_12px_rgba(99,102,241,0.18)] backdrop-blur-xl dark:border-primary/30 dark:bg-primary/15 dark:shadow-[0_2px_12px_rgba(99,102,241,0.12)]"
                    : "font-medium text-muted-foreground hover:bg-white/60 hover:text-foreground hover:shadow-sm dark:hover:bg-white/10",
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
