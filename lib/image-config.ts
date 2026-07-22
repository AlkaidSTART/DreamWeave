import type { ImageRatio, ImageQuality } from "@/lib/types";

export type { ImageRatio, ImageQuality };
export interface RatioOption {
  label: string;
  value: ImageRatio;
  description: string;
}

export interface QualityOption {
  label: string;
  value: ImageQuality;
  description: string;
}

export const RATIO_OPTIONS: RatioOption[] = [
  { label: "1:1", value: "1:1", description: "正方形" },
  { label: "3:4", value: "3:4", description: "竖屏" },
  { label: "4:3", value: "4:3", description: "横屏" },
  { label: "16:9", value: "16:9", description: "宽屏" },
  { label: "9:16", value: "9:16", description: "手机竖屏" },
  { label: "2:3", value: "2:3", description: "海报竖屏" },
  { label: "3:2", value: "3:2", description: "海报横屏" },
  { label: "21:9", value: "21:9", description: "电影宽屏" },
];

export const QUALITY_OPTIONS: QualityOption[] = [
  { label: "1K", value: "1K", description: "快速预览" },
  { label: "2K", value: "2K", description: "标准清晰" },
  { label: "3K", value: "3K", description: "高清细节" },
  { label: "4K", value: "4K", description: "超清画质" },
];

export const DEFAULT_RATIO: ImageRatio = "1:1";
export const DEFAULT_QUALITY: ImageQuality = "2K";

const SIZE_MAP: Record<ImageRatio, Record<ImageQuality, string>> = {
  "1:1": {
    "1K": "1024x1024",
    "2K": "2048x2048",
    "3K": "3072x3072",
    "4K": "4096x4096",
  },
  "3:4": {
    "1K": "864x1152",
    "2K": "1728x2304",
    "3K": "2592x3456",
    "4K": "3456x4608",
  },
  "4:3": {
    "1K": "1152x864",
    "2K": "2304x1728",
    "3K": "3456x2592",
    "4K": "4608x3456",
  },
  "16:9": {
    "1K": "1312x736",
    "2K": "2624x1472",
    "3K": "3936x2208",
    "4K": "5248x2944",
  },
  "9:16": {
    "1K": "736x1312",
    "2K": "1472x2624",
    "3K": "2208x3936",
    "4K": "2944x5248",
  },
  "2:3": {
    "1K": "832x1248",
    "2K": "1664x2496",
    "3K": "2496x3744",
    "4K": "3328x4992",
  },
  "3:2": {
    "1K": "1248x832",
    "2K": "2496x1664",
    "3K": "3744x2496",
    "4K": "4992x3328",
  },
  "21:9": {
    "1K": "1568x672",
    "2K": "3136x1344",
    "3K": "4704x2016",
    "4K": "6272x2688",
  },
};

export function resolveImageSize(
  ratio: ImageRatio = DEFAULT_RATIO,
  quality: ImageQuality = DEFAULT_QUALITY,
): string {
  return SIZE_MAP[ratio][quality];
}

export function parseImageSize(size: string): { width: number; height: number } {
  const [width, height] = size.split("x").map((part) => Number.parseInt(part, 10));
  return { width, height };
}
