import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/text-to-image", label: "文生图" },
  { href: "/image-to-image", label: "图生图" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-white/10 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-black/40">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Dreamweave
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/20 bg-white/40 px-1.5 py-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/60 hover:text-foreground hover:shadow-sm dark:hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
