# Dreamweave

<p align="center">
  <strong>基于 Next.js 的 AI 图像生成平台</strong>
</p>

<p align="center">
  文生图 · 图生图 · 提示词润色 · 作品图库 · 用户认证
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma">
</p>

---

## 简介

Dreamweave 是一个现代化的 AI 图像生成应用，帮助用户通过自然语言描述或参考图片快速生成高质量图像。项目采用 Next.js App Router 构建，结合 Supabase 认证与存储、PostgreSQL 数据库、BullMQ 队列，提供流畅的生成体验与可靠的任务调度。

## 功能特性

- **文生图**：输入提示词，调用 Agnes AI 生成多张图片
- **图生图**：上传参考图，基于原图进行风格化重绘
- **提示词润色**：自动优化中文/英文提示词，提升生成质量
- **作品图库**：查看、下载、删除历史生成任务
- **用户认证**：支持邮箱注册登录与 GitHub OAuth
- **数据隔离**：每个用户通过 UUID 隔离，生成记录与图片按用户存储
- **实时进度**：通过 Server-Sent Events 实时展示生成进度
- **响应式界面**：支持桌面端与移动端访问

## 技术栈

- **框架**：Next.js 16 + React 19 + TypeScript
- **样式**：Tailwind CSS v4 + Geist 字体
- **数据库**：PostgreSQL + Prisma v7（TypeScript 重构版）
- **认证与存储**：Supabase Auth + Supabase Storage
- **队列**：BullMQ + Redis（ioredis）
- **测试**：Vitest + React Testing Library + Playwright
- **动画**：GSAP + @gsap/react

## 快速开始

### 前置条件

- Node.js 20+
- PostgreSQL 数据库（推荐 Supabase）
- Redis 实例（推荐 Upstash）
- Agnes AI API Key

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local`，并填写以下关键配置：

```bash
# AI 图像生成
IMAGE_GENERATION_PROVIDER=agnes
IMAGE_GENERATION_API_KEY=your_agnes_api_key
IMAGE_GENERATION_API_URL=https://apihub.agnes-ai.com/v1/images/generations
AGNES_MODEL=agnes-image-2.1-flash
AGNES_SIZE=1024x768

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

# PostgreSQL
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...:5432/postgres"

# Redis
REDIS_URL="rediss://..."
```

### 数据库迁移

```bash
npx prisma migrate dev
npx prisma generate
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run lint             # ESLint 检查
npm run typecheck        # TypeScript 类型检查
npm run test             # 运行所有测试
npm run test:unit        # 单元测试
npm run test:integration # 集成测试
npm run test:e2e         # E2E 测试
```

## 项目结构

```
app/              # Next.js App Router 页面与 API 路由
components/       # React 组件与 UI 组件
lib/              # 工具函数、API 封装、Prisma/Supabase 客户端
src/services/     # 业务服务：图像生成、任务存储、图片存储、提示词润色
src/queue/        # BullMQ 队列与 Worker
prisma/           # Prisma schema 与迁移文件
tests/            # 单元测试与集成测试
```

## 数据模型

- **User**：用户基础信息，与生成任务一对多关联
- **GenerationJob**：生成任务，包含提示词、状态、进度、关联结果
- **GenerationResult**：单张生成结果，记录图片 URL 与 Supabase Storage 路径

生成的图片按 `userbucket/{userId}/{jobId}/{imageId}.png` 路径存储。

## 部署

项目默认部署到 Vercel。需要在 Vercel 控制台配置相同的环境变量，并确保：

1. `DATABASE_URL` 使用支持连接池的地址
2. `DIRECT_URL` 用于 Prisma Migrate
3. Redis 使用支持 TLS 的地址
4. Supabase Storage 中创建 `userbucket` 存储桶并设置为 public

## 贡献指南

欢迎提交 Issue 和 Pull Request。在贡献代码前，请确保：

1. 代码通过 `npm run lint` 和 `npm run typecheck`
2. 相关测试通过 `npm run test`
3. 遵循项目已有的代码风格和目录结构
4. 提交信息清晰说明改动原因

## 安全说明

- API Key 等敏感信息必须存放在 `.env.local` 中，不要提交到版本控制
- Supabase 存储桶 `userbucket` 需要正确配置访问权限
- 生产环境建议启用 Supabase Row Level Security（RLS）

## 许可证

[MIT](LICENSE)

---

<p align="center">
  如果这个项目对你有帮助，欢迎点亮 Star ⭐
</p>
