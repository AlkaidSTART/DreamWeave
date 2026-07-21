import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/text-to-image", label: "文生图" },
  { href: "/image-to-image", label: "图生图" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-border bg-background/80 backdrop-blur-md">
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

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card-elevated hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="upgrade" size="sm" className="hidden sm:inline-flex">
            升级 Pro
          </Button>
        </div>
      </div>
    </header>
  );
}
