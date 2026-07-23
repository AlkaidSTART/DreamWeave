import type { Skill, SkillType } from "@/lib/types";

export const skills: Skill[] = [
  // 通用图像生成
  {
    id: "ai-image-generation",
    name: "AI 图片生成",
    category: "通用",
    description: "通用高质量图像生成，适合任意主题与风格",
    type: "general",
    template:
      "Create a high-quality image based on the following description. {prompt}",
    isDefault: false,
  },

  // 摄影风格
  {
    id: "photography-portrait",
    name: "人像摄影",
    category: "摄影",
    description: "专业人像摄影风格，柔和光线，细腻质感",
    type: "photography",
    template:
      "professional portrait photography, soft lighting, high detail, 8k resolution, photorealistic, {prompt}",
    isDefault: false,
  },
  {
    id: "photography-landscape",
    name: "风光摄影",
    category: "摄影",
    description: "壮丽自然风光，层次分明，色彩饱满",
    type: "photography",
    template:
      "stunning landscape photography, golden hour lighting, vivid colors, 8k resolution, {prompt}",
    isDefault: false,
  },

  // 插画/动漫
  {
    id: "illustration-flat",
    name: "扁平插画",
    category: "插画",
    description: "现代扁平插画风格，简洁配色",
    type: "illustration",
    template:
      "flat illustration, modern design, minimal color palette, vector style, {prompt}",
    isDefault: true,
  },
  {
    id: "anime",
    name: "动漫",
    category: "动漫",
    description: "日式动漫风格，鲜明色彩与细腻线条",
    type: "illustration",
    template:
      "anime style illustration, vibrant colors, clean linework, detailed background, {prompt}",
    isDefault: false,
  },

  // 电影
  {
    id: "cinematic",
    name: "电影感",
    category: "电影",
    description: "电影级构图与调色，戏剧化光影",
    type: "cinematic",
    template:
      "cinematic shot, dramatic lighting, film grain, color grading, 8k, {prompt}",
    isDefault: false,
  },

  // 封面图片生成
  {
    id: "cover-image",
    name: "封面图片",
    category: "封面",
    description: "文章封面图，强调留白、视觉焦点与标题区域",
    type: "cover",
    template:
      "Create an elegant article cover image. Cover image / hero image. Use simplified silhouettes or icons for any figures, no realistic human faces. Maintain 40-60% whitespace, center or slightly offset the main visual, and keep the composition clean with solid colors or subtle gradients. Represent concepts with simple, recognizable icons. {prompt}",
    isDefault: false,
  },

  // 信息图表生成
  {
    id: "infographic",
    name: "信息图表",
    category: "信息图",
    description: "专业信息图，强调信息架构与视觉层次",
    type: "infographic",
    template:
      "Create a professional infographic. Follow a clear information architecture with generous whitespace and visual hierarchy. Keep text concise, emphasize keywords and core concepts, and use the same language as the content. If figures appear, use simplified stylized silhouettes. {prompt}",
    isDefault: false,
  },

  // 小红书图片生成
  {
    id: "xhs-image-cards",
    name: "小红书图片",
    category: "社媒",
    description: "小红书风格图文卡片，手绘感与信息密度兼顾",
    type: "xhs",
    template:
      "Create a Xiaohongshu (Little Red Book) style infographic card in portrait orientation (3:4). Hand-drawn illustration style throughout, no realistic or photographic elements. Keep information concise, highlight keywords with hand-drawn highlighter effects, and use clear visual hierarchy with ample whitespace. All text must be hand-drawn style, not computer fonts. {prompt}",
    isDefault: false,
  },

  // 文章配图生成器
  {
    id: "article-illustration",
    name: "文章配图",
    category: "配图",
    description: "为文章段落生成语义一致的插图",
    type: "article",
    template:
      "Create an illustration for an article. Use a clean composition with generous whitespace, simple or no background, and main elements centered or positioned by content needs. Text should be large, prominent, and hand-drawn style when present. Use simplified stylized silhouettes for human figures. Color values are rendering guidance only; do not display color names or hex codes as visible text. {prompt}",
    isDefault: false,
  },

  // 图表生成器
  {
    id: "diagram",
    name: "技术图表",
    category: "图表",
    description: "架构图、流程图、时序图等技术图表",
    type: "diagram",
    template:
      "Create a professional technical diagram with a dark slate background (#0f172a) and subtle grid. Use semantic colors: cyan for frontend/inputs, emerald for backend/services, violet for databases, amber for cloud/infrastructure, rose for security/warnings, orange for middleware, slate for external/unknown, blue for active/highlight. Use JetBrains Mono or monospace font. Draw background first, then boundaries, connection arrows, opaque masking rects, component boxes, text labels, legend, and title block in that order. Ensure 30px padding in the viewBox and no overlapping elements. {prompt}",
    isDefault: false,
  },
];

export function getSkillTemplate(skillId?: string): string | undefined {
  if (!skillId) return undefined;
  return skills.find((skill) => skill.id === skillId)?.template;
}

export function getSkillType(skillId?: string): SkillType | undefined {
  if (!skillId) return undefined;
  return skills.find((skill) => skill.id === skillId)?.type;
}
