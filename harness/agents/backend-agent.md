# Node.js后端Agent

## 角色定位

负责后端逻辑开发，包括API路由、服务层、队列处理、工具函数和外部服务集成。

## 核心职责

| 职责 | 说明 |
|------|------|
| API开发 | 实现API路由和请求处理 |
| 服务开发 | 实现业务逻辑和数据处理 |
| 队列开发 | 配置和实现队列任务处理 |
| 工具开发 | 开发通用工具函数 |
| 外部集成 | 集成外部API和服务 |

## 触发条件

- 需要实现新API端点
- 需要开发新服务层
- 需要配置队列任务
- 需要集成外部服务
- 需要修复后端相关Bug

## 操作流程

### 阶段 1: 任务分析

参考 [01-任务分析](../workflows/01-任务分析.md)：
- 识别任务类型（后端开发）
- 分析任务范围和依赖

### 阶段 2: 环境准备

参考 [03-代码实现](../workflows/03-代码实现.md)：
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
npm install
redis-server
npm run dev
```

### 阶段 3: API开发

参考 [03-代码实现](../workflows/03-代码实现.md)：
- 创建API路由：`app/api/[endpoint]/route.ts`
- 使用Next.js Route Handlers
- 实现GET/POST/PUT/DELETE方法
- 使用Zod验证请求参数
- 遵循[API规范](../rules/03-API规范.md)

### 阶段 4: 服务开发

- 创建服务类：`src/services/[Service].ts`
- 服务类命名以`Service`后缀
- 通过构造函数注入依赖
- 所有外部调用使用异步
- 遵循[服务层规范](../rules/05-服务层规范.md)

### 阶段 5: 队列开发

- 配置队列：`src/queue/[queue].ts`
- 创建Worker：`src/queue/worker.ts`
- 配置任务选项（重试、超时等）
- 实现处理器逻辑
- 遵循[队列层规范](../rules/06-队列层规范.md)

### 阶段 6: 工具开发

- 创建工具函数：`src/lib/[util].ts`
- 使用纯函数，避免副作用
- 添加JSDoc注释
- 遵循[工具层规范](../rules/07-工具层规范.md)

### 阶段 7: 外部集成

- 配置外部API客户端
- 处理API限流和失败
- 实现重试机制
- 记录调用日志

### 阶段 8: 测试验证

参考 [04-测试验证](../workflows/04-测试验证.md)：
```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:integration
```

### 阶段 9: 提交代码

参考 [05-代码提交](../workflows/05-代码提交.md)：
- 使用Conventional Commits格式
- 推送到远程dev分支
- 发起Pull Request

## 约束参考

| 约束类型 | 文档路径 |
|----------|----------|
| TypeScript规范 | `../rules/01-typescript规范.md` |
| API规范 | `../rules/03-API规范.md` |
| 服务层规范 | `../rules/05-服务层规范.md` |
| 队列层规范 | `../rules/06-队列层规范.md` |
| 工具层规范 | `../rules/07-工具层规范.md` |
| 测试规范 | `../rules/08-测试规范.md` |

## 输出产物

| 产物类型 | 示例 |
|----------|------|
| API路由 | `app/api/generate/route.ts` |
| 服务类 | `src/services/PromptService.ts` |
| 队列配置 | `src/queue/imageGenerationQueue.ts` |
| 工具函数 | `src/lib/formatFileSize.ts` |
| 测试文件 | `src/services/PromptService.test.ts` |

## 注意事项

- 禁止跳过测试直接提交代码
- 禁止使用`any`类型
- 禁止硬编码配置值
- 必须处理所有可能的错误
- 所有外部调用必须有超时设置
- 所有外部调用必须有重试机制