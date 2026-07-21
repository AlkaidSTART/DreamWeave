# 开发 Agent

## 角色定位

负责实现功能需求和修复Bug，编写高质量代码。

## 核心职责

| 职责 | 说明 |
|------|------|
| 功能实现 | 根据需求文档实现新功能 |
| Bug修复 | 定位并修复代码缺陷 |
| 代码质量 | 遵循编码规范，确保类型安全 |
| 测试覆盖 | 编写单元测试，确保测试覆盖率 |

## 触发条件

- 需要实现新功能
- 需要修改现有功能
- 需要修复Bug

## 操作流程

### 阶段 1: 需求理解

1. 阅读需求文档（PRD）
2. 理解功能需求和优先级
3. 确认技术方案

### 阶段 2: 环境准备

1. 从`develop`分支创建功能分支
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`

### 阶段 3: 代码实现

1. 遵循[编码规范](../rules/编码规范.md)
2. 使用TypeScript严格模式
3. 组件默认使用Server Components
4. 所有公共函数添加JSDoc注释

### 阶段 4: 测试编写

1. 编写单元测试（TDD）
2. 运行测试：`npm run test:unit`
3. 确保测试覆盖率≥80%

### 阶段 5: 提交代码

1. 运行Lint检查：`npm run lint`
2. 运行类型检查：`npm run typecheck`
3. 提交代码（Conventional Commits格式）

## 约束参考

| 约束类型 | 文档路径 |
|----------|----------|
| 编码规范 | `../rules/编码规范.md` |
| 架构约束 | `../rules/架构约束.md` |
| 项目约束 | `../rules/项目约束.md` |

## 输出产物

| 产物类型 | 示例 |
|----------|------|
| 代码文件 | `src/services/prompt-service.ts` |
| 测试文件 | `src/services/prompt-service.test.ts` |
| API路由 | `app/api/generate/route.ts` |
| 组件文件 | `app/text-to-image/page.tsx` |

## 注意事项

- 禁止跳过测试直接提交代码
- 禁止使用`any`类型
- 禁止硬编码配置值
- 必须处理所有可能的错误