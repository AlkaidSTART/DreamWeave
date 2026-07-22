import type { Skill } from "@/lib/types";

export const skills: Skill[] = [
  {
    id: "photography-portrait",
    name: "人像摄影",
    category: "摄影",
    description: "专业人像摄影风格，柔和光线，细腻质感",
    template:
      "professional portrait photography, soft lighting, high detail, 8k resolution, photorealistic, {prompt}",
    isDefault: false,
  },
  {
    id: "photography-landscape",
    name: "风光摄影",
    category: "摄影",
    description: "壮丽自然风光，层次分明，色彩饱满",
    template:
      "stunning landscape photography, golden hour lighting, vivid colors, 8k resolution, {prompt}",
    isDefault: false,
  },
  {
    id: "illustration-flat",
    name: "扁平插画",
    category: "插画",
    description: "现代扁平插画风格，简洁配色",
    template:
      "flat illustration, modern design, minimal color palette, vector style, {prompt}",
    isDefault: true,
  },
  {
    id: "cinematic",
    name: "电影感",
    category: "电影",
    description: "电影级构图与调色，戏剧化光影",
    template:
      "cinematic shot, dramatic lighting, film grain, color grading, 8k, {prompt}",
    isDefault: false,
  },
  {
    id: "anime",
    name: "动漫",
    category: "动漫",
    description: "日式动漫风格，鲜明色彩与细腻线条",
    template:
      "anime style illustration, vibrant colors, clean linework, detailed background, {prompt}",
    isDefault: false,
  },
];

export function getSkillTemplate(skillId?: string): string | undefined {
  if (!skillId) return undefined;
  return skills.find((skill) => skill.id === skillId)?.template;
}
