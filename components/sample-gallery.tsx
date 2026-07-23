"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface SampleItem {
  prompt: string;
  label: string;
  url?: string;
}

const samples: SampleItem[] = [
  {
    prompt: "A serene Japanese garden with cherry blossoms, soft morning light, minimalist composition, ultra detailed, 8k",
    label: "日式庭院",
  },
  {
    prompt: "Futuristic neon cityscape at night, cyberpunk aesthetic, rain soaked streets with reflections, cinematic lighting",
    label: "赛博都市",
  },
  {
    prompt: "Cute fluffy kitten playing on fresh green grass, golden hour sunlight, photorealistic, high detail",
    label: "萌宠时光",
  },
  {
    prompt: "Elegant minimalist product photography of a luxury perfume bottle, soft gradient background, studio lighting",
    label: "极简产品",
  },
  {
    prompt: "Dreamy watercolor landscape with misty mountains and pine trees, pastel colors, artistic hand painted style",
    label: "水墨山水",
  },
  {
    prompt: "Modern abstract 3D render with smooth geometric shapes, vibrant gradients, clean composition, soft shadows",
    label: "抽象几何",
  },
  {
    prompt: "Vintage film portrait of a young woman, warm golden tones, soft bokeh background, cinematic mood",
    label: "复古肖像",
  },
  {
    prompt: "Surreal floating islands in a cloudy sky, fantasy art, dramatic lighting, epic scale, highly detailed",
    label: "奇幻浮岛",
  },
];

function getSampleUrl(prompt: string) {
  const encoded = encodeURIComponent(prompt);
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encoded}&image_size=portrait_4_3`;
}

export function SampleGallery({ className }: { className?: string }) {
  return (
    <section
      id="samples"
      className={cn(
        "mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 lg:px-8",
        className,
      )}
    >
      <div className="mb-10 text-center md:mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          示例作品
        </h2>
        <p className="mt-2 text-muted-foreground">
          由 Dreamweave 生成的创意图像，点击即可开始你的创作
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {samples.map((item, index) => (
          <div
            key={index}
            className="sample-item group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-md"
          >
            <Image
              src={item.url || getSampleUrl(item.prompt)}
              alt={item.label}
              fill
              className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-sm font-semibold text-white">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}