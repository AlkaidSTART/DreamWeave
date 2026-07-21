import Link from "next/link";
import { Type, Image, Wand2, ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";

export default function Home() {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-mint-500/10 opacity-60" />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center md:px-6 md:py-28 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            让想象触手可及
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            用文字或图片，在几秒内生成高质量视觉作品。简约、高效、充满惊喜。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
              <Link href="/text-to-image">开始创作</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/image-to-image">图生图体验</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            三种创作方式
          </h2>
          <p className="mt-2 text-muted-foreground">选择最适合你的表达方式</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Type}
            title="文生图"
            description="输入文字描述，AI 自动理解并生成高质量图像，支持多张并行生成。"
          />
          <FeatureCard
            icon={Image}
            title="图生图"
            description="上传参考图片，AI 在此基础上创作新作品，保留核心构图与风格。"
          />
          <FeatureCard
            icon={Wand2}
            title="提示词润色"
            description="系统自动优化提示词结构，让生成结果更专业、更具质感。"
          />
        </div>
      </section>

      <section className="border-t border-border bg-card-elevated/50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6 lg:px-8">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">
            免费开始创作
          </h2>
          <p className="mt-2 text-muted-foreground">
            无需注册，立即体验 AI 生图的无限可能。
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/text-to-image">立即尝试</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
