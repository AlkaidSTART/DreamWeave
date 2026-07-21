# 13 - Tailwind 配置示例

## 13.1 globals.css

以下配置基于 Tailwind CSS v4，使用 `@theme` 指令定义设计 Token，可直接用于项目。

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #FAFAFA;
  --foreground: #18181B;
  --card: #FFFFFF;
  --card-elevated: #F4F4F5;
  --border: #E4E4E7;
  --border-accent: #C7D2FE;
  --muted: #52525B;
  --muted-foreground: #A1A1AA;

  --indigo-50: #EEF2FF;
  --indigo-100: #E0E7FF;
  --indigo-200: #C7D2FE;
  --indigo-400: #818CF8;
  --indigo-500: #6366F1;
  --indigo-600: #4F46E5;
  --indigo-700: #4338CA;

  --mint-400: #2DD4BF;
  --mint-500: #14B8A6;

  --amber-500: #F59E0B;
  --amber-600: #D97706;

  --error: #EF4444;
}

.dark {
  --background: #09090B;
  --foreground: #FAFAFA;
  --card: #18181B;
  --card-elevated: #27272A;
  --border: rgba(255,255,255,0.08);
  --border-accent: #4338CA;
  --muted: #A1A1AA;
  --muted-foreground: #52525B;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-elevated: var(--card-elevated);
  --color-border: var(--border);
  --color-border-accent: var(--border-accent);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-indigo-50: var(--indigo-50);
  --color-indigo-100: var(--indigo-100);
  --color-indigo-200: var(--indigo-200);
  --color-indigo-400: var(--indigo-400);
  --color-indigo-500: var(--indigo-500);
  --color-indigo-600: var(--indigo-600);
  --color-indigo-700: var(--indigo-700);

  --color-mint-400: var(--mint-400);
  --color-mint-500: var(--mint-500);

  --color-amber-500: var(--amber-500);
  --color-amber-600: var(--amber-600);

  --color-error: var(--error);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-satoshi);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.08);
  --shadow-glow: 0 0 24px rgba(99,102,241,0.24);

  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 13.2 layout.tsx 字体配置

```tsx
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const satoshi = localFont({
  src: "/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} antialiased`}>
      <body className="min-h-full bg-background text-foreground font-sans">{children}</body>
    </html>
  );
}
```

## 13.3 常用类名模式

```
页面容器: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
卡片: bg-card rounded-2xl border border-border p-5 md:p-6
主标题: font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight
正文: text-base leading-relaxed text-muted
主按钮: h-11 px-5 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 transition-all
```

## 13.4 说明

此配置为起点，开发中根据实际组件需要可扩展 `--color-*` 与 `--radius-*` Token。所有颜色与间距变更必须经过本设计文档评审。
