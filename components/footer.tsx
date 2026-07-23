import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const footerLinks = [
  { href: "/text-to-image", label: "文生图" },
  { href: "/image-to-image", label: "图生图" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/25 bg-white/22 backdrop-blur-2xl dark:border-white/10 dark:bg-black/20">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
            aria-label="Dreamweave 首页"
          >
            <BrandMark className="h-8 w-8" />
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
