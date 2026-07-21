import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = [
  { href: "/text-to-image", label: "文生图" },
  { href: "/image-to-image", label: "图生图" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Dreamweave
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dreamweave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
