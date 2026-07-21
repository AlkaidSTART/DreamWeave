# Dreamweave AI 生图平台 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位

Dreamweave 是一个基于 AI 的创意图像生成平台，致力于为用户提供简单、高效、高质量的图像生成体验。用户只需输入文字描述或上传参考图片，即可生成符合需求的创意图像。

### 1.2 目标用户

| 用户群体 | 特征 | 需求场景 |
|----------|------|----------|
| 设计师 | 需要快速生成设计灵感图 | 概念设计、海报素材、UI原型 |
| 内容创作者 | 需要配图素材 | 社交媒体配图、文章插图、短视频素材 |
| 开发者 | 需要测试/演示图片 | 应用测试、原型开发、演示数据 |
| 普通用户 | 需要个性化图片 | 头像生成、壁纸制作、创意表达 |

### 1.3 核心价值

- **简单易用**: 无需专业技能，输入文字即可生成图像
- **高质量输出**: 通过大模型提示词润色，提升生成质量
- **高效快捷**: 异步并发处理，支持批量生成
- **灵活多样**: 支持文生图、图生图多种模式

---

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 文生图 (Text-to-Image)

| 需求编号 | 需求描述 | 优先级 |
|----------|----------|--------|
| T2I-001 | 用户输入文字描述（提示词） | P0 |
| T2I-002 | 系统自动润色提示词（大模型） | P0 |
| T2I-003 | 用户选择生成图片数量（1-4张） | P0 |
| T2I-004 | 异步并发生成图片 | P0 |
| T2I-005 | 展示生成进度 | P0 |
| T2I-006 | 展示生成结果图片 | P0 |
| T2I-007 | 一键导出单张/全部图片为PNG | P0 |

#### 2.1.2 图生图 (Image-to-Image)

| 需求编号 | 需求描述 | 优先级 |
|----------|----------|--------|
| I2I-001 | 用户上传参考图片 | P0 |
| I2I-002 | 用户输入文字描述（可选） | P1 |
| I2I-003 | 系统自动润色提示词（大模型） | P0 |
| I2I-004 | 用户选择生成图片数量（1-4张） | P0 |
| I2I-005 | 异步并发生成图片 | P0 |
| I2I-006 | 展示生成进度 | P0 |
| I2I-007 | 展示生成结果图片（对比原图） | P0 |
| I2I-008 | 一键导出单张/全部图片为PNG | P0 |

#### 2.1.3 提示词润色

| 需求编号 | 需求描述 | 优先级 |
|----------|----------|--------|
| PROMPT-001 | 自动分析用户输入的提示词 | P0 |
| PROMPT-002 | 调用大模型优化提示词结构 | P0 |
| PROMPT-003 | 展示优化前后的提示词对比 | P1 |
| PROMPT-004 | 用户可选择是否使用优化后的提示词 | P1 |

#### 2.1.4 Skill（提示词模板）

| 需求编号 | 需求描述 | 优先级 |
|----------|----------|--------|
| SKILL-001 | 提供预设的提示词模板分类 | P0 |
| SKILL-002 | 用户可选择模板应用到提示词 | P0 |
| SKILL-003 | 模板自动补充专业术语和风格描述 | P0 |
| SKILL-004 | 支持多种风格模板（摄影、插画、电影、动漫等） | P0 |
| SKILL-005 | 用户可自定义保存常用模板 | P2 |
| SKILL-006 | 模板预览效果展示 | P1 |

### 2.2 辅助功能

| 需求编号 | 需求描述 | 优先级 |
|----------|----------|--------|
| AUX-001 | 生成历史记录 | P1 |
| AUX-002 | 图片预览（点击放大） | P1 |
| AUX-003 | 错误提示和重试机制 | P0 |
| AUX-004 | 加载状态提示 | P0 |

---

## 3. 技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  文生图页面   │  │  图生图页面   │  │    结果展示组件      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼──────────────────┼─────────────────────┼───────────────┘
          │                  │                     │
          ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API 层 (Route Handlers)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ /api/generate│  │ /api/upload  │  │ /api/jobs/[jobId]    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼──────────────────┼─────────────────────┼───────────────┘
          │                  │                     │
          ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      队列层 (BullMQ + Redis)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           ImageGenerationQueue                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   Job 1     │  │   Job 2     │  │   Job N     │      │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │   │
│  │         │                │                │              │   │
│  │         ▼                ▼                ▼              │   │
│  │  ┌───────────────────────────────────────┐              │   │
│  │  │          Worker Pool (并发处理)        │              │   │
│  │  └───────────────────┬───────────────────┘              │   │
│  └───────────────────────┼──────────────────────────────────┘   │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      外部服务层                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  AI生图API       │  │  大模型API       │                    │
│  │  (文生图/图生图)  │  │  (提示词润色)    │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 技术选型

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 前端框架 | Next.js | 16.x | App Router、Server Components、内置API路由 |
| UI框架 | React | 19.x | 最新特性、并发模式支持 |
| CSS | Tailwind CSS | 4.x | 原子化CSS、零配置、性能优化 |
| 语言 | TypeScript | 5.x | 类型安全、开发体验 |
| 消息队列 | BullMQ | 5.x | 基于Redis、支持并发、重试机制 |
| Redis客户端 | ioredis | 5.x | 高性能、支持Cluster、连接池 |
| 图片处理 | Sharp | 0.33.x | 高性能图片处理、格式转换 |

### 3.3 目录结构

```
dreamweave/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页（入口）
│   ├── text-to-image/      # 文生图页面
│   │   └── page.tsx
│   ├── image-to-image/     # 图生图页面
│   │   └── page.tsx
│   ├── result/             # 结果展示页面
│   │   └── [jobId]/page.tsx
│   └── api/                # API层（Route Handlers）
│       ├── generate/route.ts          # 生成请求API
│       ├── upload/route.ts            # 图片上传API
│       ├── jobs/[jobId]/route.ts      # 任务状态查询API
│       └── jobs/[jobId]/stream/route.ts  # SSE实时进度API
├── src/
│   ├── queue/              # 队列层
│   │   ├── queue.ts        # Queue配置
│   │   ├── worker.ts       # Worker配置
│   │   └── processor.ts    # 任务处理器
│   ├── services/           # 服务层
│   │   ├── ai-service.ts   # AI生图服务
│   │   └── prompt-service.ts # 提示词润色服务
│   ├── skills/             # Skill层（提示词模板）
│   │   ├── index.ts        # Skill注册和管理
│   │   └── templates/      # 预设提示词模板
│   │       ├── photography.ts
│   │       ├── illustration.ts
│   │       ├── cinematic.ts
│   │       └── anime.ts
│   ├── lib/                # 工具库
│   │   ├── redis.ts        # Redis连接
│   │   ├── config.ts       # 配置管理
│   │   ├── storage.ts      # 文件存储工具
│   │   └── sse.ts          # SSE工具
│   └── types/              # 类型定义
│       └── index.ts
├── docs/                   # 文档
├── public/                 # 静态资源
│   └── uploads/            # 上传图片和生成结果存储
├── worker.js               # Worker进程入口
└── ...
```

### 3.4 核心数据模型

#### 3.4.1 Job（生成任务）

```typescript
interface GenerationJob {
  id: string;                    // 任务ID（UUID）
  type: 'text-to-image' | 'image-to-image';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;                // 用户原始提示词
  refinedPrompt: string;         // 优化后的提示词
  skillId?: string;              // 选中的Skill模板ID
  imageCount: number;            // 生成数量（1-4）
  inputImage?: string;           // 输入图片URL（图生图）
  results: GeneratedImage[];     // 生成结果
  progress: number;              // 生成进度（0-100）
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}
```

#### 3.4.2 GeneratedImage（生成图片）

```typescript
interface GeneratedImage {
  id: string;
  url: string;                   // 图片URL（本地存储路径）
  width: number;
  height: number;
  status: 'pending' | 'completed' | 'failed';
}
```

#### 3.4.3 Skill（提示词模板）

```typescript
interface Skill {
  id: string;                    // 模板ID
  name: string;                  // 模板名称
  category: string;              // 分类（摄影、插画、电影、动漫等）
  description: string;           // 模板描述
  template: string;              // 提示词模板（支持占位符）
  previewUrl?: string;           // 预览效果图URL
  isDefault: boolean;            // 是否为默认模板
}
```

---

## 4. API 设计

### 4.1 生成请求 API

**POST /api/generate**

请求体：
```json
{
  "type": "text-to-image",
  "prompt": "一只可爱的小猫在草地上玩耍",
  "imageCount": 2,
  "inputImage": null
}
```

响应：
```json
{
  "jobId": "uuid-xxx",
  "status": "pending",
  "message": "任务已提交"
}
```

### 4.2 图片上传 API

**POST /api/upload**

请求：`multipart/form-data`

响应：
```json
{
  "url": "/uploads/image-xxx.png",
  "width": 1024,
  "height": 768
}
```

### 4.3 任务状态查询 API

**GET /api/jobs/[jobId]**

响应：
```json
{
  "jobId": "uuid-xxx",
  "type": "text-to-image",
  "status": "processing",
  "progress": 50,
  "prompt": "一只可爱的小猫在草地上玩耍",
  "refinedPrompt": "A cute fluffy kitten playing on green grass, soft lighting, high detail, 8k resolution",
  "skillId": "photography-portrait",
  "imageCount": 2,
  "results": [
    { "id": "img-1", "url": "/uploads/uuid-xxx/img-1.png", "status": "completed" },
    { "id": "img-2", "url": null, "status": "processing" }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:05Z"
}
```

### 4.4 SSE 实时进度 API

**GET /api/jobs/[jobId]/stream**

响应类型：`text/event-stream`

响应示例：
```
event: progress
data: {"progress": 25, "status": "processing"}

event: progress
data: {"progress": 50, "status": "processing", "results": [{"id": "img-1", "url": "/uploads/uuid-xxx/img-1.png", "status": "completed"}]}

event: complete
data: {"progress": 100, "status": "completed", "results": [...]}

event: error
data: {"status": "failed", "error": "生成失败"}
```

### 4.5 Skill 模板 API

**GET /api/skills**

响应：
```json
{
  "skills": [
    {
      "id": "photography-portrait",
      "name": "人像摄影",
      "category": "摄影",
      "description": "专业人像摄影风格，柔和光线，细腻质感",
      "template": "professional portrait photography, soft lighting, high detail, 8k resolution, photorealistic, {prompt}",
      "isDefault": false
    },
    {
      "id": "illustration-flat",
      "name": "扁平插画",
      "category": "插画",
      "description": "现代扁平插画风格，简洁配色",
      "template": "flat illustration, modern design, minimal color palette, vector style, {prompt}",
      "isDefault": false
    }
  ]
}
```

---

## 5. 用户体验设计

### 5.1 页面流程

#### 文生图流程

```
首页 → 文生图页面 → 输入提示词 → 选择数量 → 提交 → 等待生成 → 展示结果 → 导出
```

#### 图生图流程

```
首页 → 图生图页面 → 上传图片 → 输入提示词(可选) → 选择数量 → 提交 → 等待生成 → 展示结果 → 导出
```

### 5.2 交互设计

| 场景 | 交互方式 |
|------|----------|
| 提示词输入 | 文本框，支持换行，实时字数统计 |
| Skill模板选择 | 下拉菜单或卡片选择，展示模板预览 |
| 图片上传 | 拖拽上传 + 点击选择，预览缩略图 |
| 数量选择 | 单选按钮组（1/2/3/4） |
| 提交生成 | 按钮点击，显示加载状态 |
| 生成进度 | 实时进度条（SSE推送）+ 百分比 + 状态文字 |
| 结果展示 | 网格布局，每张图片带下载按钮 |
| 错误处理 | 错误提示弹窗，支持重试 |

### 5.3 视觉设计

- **风格**: 现代简约，科技感
- **主色调**: 紫色系（#8B5CF6）+ 深色背景
- **字体**: Geist（Next.js 默认字体）
- **动效**: 平滑过渡、加载动画

---

## 6. 部署方案

### 6.1 环境要求

| 组件 | 要求 |
|------|------|
| Node.js | 20.x+ |
| Redis | 7.x+ |
| 存储 | 支持文件存储（本地/云存储） |

### 6.2 配置变量

```env
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AI服务配置
AI_IMAGE_API_URL=
AI_IMAGE_API_KEY=
AI_PROMPT_API_URL=
AI_PROMPT_API_KEY=

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
```

### 6.3 启动命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 生产启动（主进程 + Worker）
npm run start
npm run worker
```

### 6.4 package.json Scripts 配置

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "worker": "node worker.js",
    "lint": "eslint",
    "test": "jest",
    "test:unit": "jest --testPathPattern='unit'",
    "test:integration": "jest --testPathPattern='integration'",
    "test:e2e": "playwright test"
  }
}
```

### 6.5 Worker 进程架构

**Worker 进程入口文件**: `worker.js`

```javascript
import { Worker } from 'bullmq';
import { processor } from './src/queue/processor';

const worker = new Worker('image-generation', processor, {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
  concurrency: 4,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

console.log('Worker process started');
```

### 6.6 本地文件存储方案

**存储路径结构**:
```
public/
└── uploads/
    ├── [jobId]/
    │   ├── input/          # 上传的输入图片（图生图）
    │   │   └── original.png
    │   └── output/         # 生成的结果图片
    │       ├── img-1.png
    │       ├── img-2.png
    │       ├── img-3.png
    │       └── img-4.png
    └── temp/               # 临时文件（定期清理）
```

**文件命名规则**:
- 输入图片: `original.[ext]`
- 输出图片: `img-[index].png`
- 文件名清理: 移除特殊字符，使用 UUID

**文件生命周期**:
- 生成完成后: 保留结果图片
- 生成失败后: 保留错误日志，清理临时文件
- 定时清理: 清理超过7天的历史记录（可选）

---

## 7. 性能要求

| 指标 | 目标值 |
|------|--------|
| 提示词润色响应时间 | < 1s |
| 单张图片生成时间 | < 15s |
| 并发处理能力 | 10+ 任务同时处理 |
| 图片导出速度 | < 1s |
| 页面加载时间 | < 2s |

---

## 8. 安全考虑

| 风险点 | 防护措施 |
|--------|----------|
| 文件上传 | 校验文件类型、大小限制、文件名清理 |
| API滥用 | 限流、请求频率限制 |
| 敏感数据 | API Key 环境变量存储 |
| XSS攻击 | Next.js 默认防护、内容转义 |
| CSRF | SameSite Cookie 策略 |

---

## 附录：需求矩阵

| 功能模块 | 需求数 | P0 | P1 | P2 |
|----------|--------|----|----|----|
| 文生图 | 7 | 6 | 1 | 0 |
| 图生图 | 8 | 6 | 2 | 0 |
| 提示词润色 | 4 | 2 | 2 | 0 |
| 辅助功能 | 4 | 2 | 2 | 0 |
| **合计** | **23** | **16** | **7** | **0** |