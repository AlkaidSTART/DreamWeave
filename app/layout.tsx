import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Dreamweave - 让想象触手可及",
  description:
    "Dreamweave 是基于 AI 的创意图像生成平台，用文字或图片在几秒内生成高质量视觉作品。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const themeScript = `
  (function () {
    function getTheme() {
      const stored = window.localStorage.getItem("dreamweave-theme");
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    const theme = getTheme();
    document.documentElement.classList.toggle("dark", theme === "dark");
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
