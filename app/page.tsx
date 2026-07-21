import Link from "next/link";
import {
  Type,
  Image,
  Wand2,
  ArrowRight,
  Sparkles,
  Play,
  Zap,
  Layers,
  Download,
  MousePointerClick,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { SampleGallery } from "@/components/sample-gallery";
import { Footer } from "@/components/footer";

const stats = [
  { value: "100K+", label: "创意生成", icon: Sparkles },
  { value: "<15s", label: "单张出图", icon: Zap },
  { value: "50+", label: "风格模板", icon: Layers },
];

const steps = [
  {
    step: "01",
    title: "描述创意",
    description: "输入文字或上传参考图，选择风格模板",
    icon: MousePointerClick,
  },
  {
    step: "02",
    title: "AI 生成",
    description: "异步并行生成，实时查看每张进度",
    icon: Wand2,
  },
  {
    step: "03",
    title: "下载使用",
    description: "一键导出高清原图，支持批量下载",
    icon: Download,
  },
];

export default function Home() {
  return (
    <PageShell footer={<Footer />}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-mint-500/15 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center md:px-6 md:py-32 lg:px-8">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 图像生成平台
          </div>

          <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            让想象
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-mint-400 bg-clip-text text-transparent">
              触手可及
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            用文字或图片，在几秒内生成高质量视觉作品。简约、高效、充满惊喜。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              asChild
            >
              <Link href="/text-to-image">开始创作</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="h-4 w-4" />}
              asChild
            >
              <Link href="#samples">查看示例</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-strong rounded-2xl p-6 text-center"
            >
              <stat.icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-3 font-display text-3xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            三种创作方式
          </h2>
          <p className="mt-3 text-muted-foreground">
            选择最适合你的表达方式
          </p>
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

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              三步开始创作
            </h2>
            <p className="mt-3 text-muted-foreground">
              从想法到成品，只需几分钟
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="glass-surface relative rounded-2xl p-6"
              >
                <span className="absolute right-4 top-4 font-display text-4xl font-bold text-foreground/5">
                  {item.step}
                </span>
                <div className="mb-4 inline-flex rounded-xl bg-indigo-50/80 p-3 backdrop-blur-sm dark:bg-indigo-950/30">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SampleGallery />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-24 text-center md:px-6 lg:px-8">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-foreground md:text-4xl">
            免费开始创作
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            无需注册，立即体验 AI 生图的无限可能。让你的每一个想法都变成可视化的作品。
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/text-to-image">立即尝试</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
