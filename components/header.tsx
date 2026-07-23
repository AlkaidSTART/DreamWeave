"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
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
    <header className="sticky top-0 z-40 h-16 w-full border-b border-white/35 bg-gradient-to-b from-white/40 via-white/28 to-white/18 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:from-slate-950/45 dark:via-slate-950/30 dark:to-slate-950/18 dark:shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-all hover:opacity-85"
          aria-label="Dreamweave 首页"
        >
          <BrandMark className="h-9 w-9" />
          <span className="font-logo text-xl font-semibold tracking-[0.01em]">
            Dreamweave
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/35 bg-white/28 px-1.5 py-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl ring-1 ring-white/35 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:ring-white/10 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium tracking-wide transition-all duration-200",
                  isActive
                    ? "border border-white/50 bg-white/72 text-foreground shadow-[0_8px_20px_rgba(15,23,42,0.12)] ring-1 ring-white/60 backdrop-blur-xl dark:border-white/15 dark:bg-white/12 dark:text-white dark:shadow-[0_8px_20px_rgba(0,0,0,0.22)] dark:ring-white/15"
                    : "text-muted-foreground/90 hover:bg-white/55 hover:text-foreground hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)] dark:hover:bg-white/10 dark:hover:text-white",
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.7)]" />
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
