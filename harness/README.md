# Dreamweave AI 生图平台 - Harness 约束体系

## 概述

本目录包含项目的约束体系文档，定义了项目的架构、编码、测试、部署等方面的规范和约束。所有开发人员必须遵守这些约束。

## 快速入口

**遇到问题？** 从项目根目录的 [AGENTS.md](../AGENTS.md) 开始，它会引导你进入正确的流程和文档。

## 文档结构

```
harness/
├── agents/                 # Agent定义（开发时的Agent角色）
│   ├── dev-agent.md        # 开发Agent - 实现功能、编写代码
│   ├── frontend-agent.md   # 前端UI Agent - 页面开发、组件实现
│   ├── backend-agent.md    # Node.js后端Agent - API开发、服务实现
│   ├── test-agent.md       # 测试Agent - 编写测试、验证功能
│   ├── review-agent.md     # 审查Agent - 代码审查、质量保证
│   ├── deploy-agent.md     # 部署Agent - 部署应用、运维管理
│   └── ops-agent.md        # 运维Agent - 监控系统、处理问题
├── workflows/              # 流程定义（整套harness流程循环）
│   ├── 00-流程概览.md      # 流程总览和完整闭环
│   ├── 01-任务分析.md      # 识别任务类型、类别、优先级
│   ├── 02-Agent选择.md     # 根据任务选择Agent
│   ├── 03-代码实现.md      # 编写代码、遵循规范
│   ├── 04-测试验证.md      # Lint、Build、Test、接口验证
│   ├── 05-代码提交.md      # 自动完善提交信息、推送到dev分支
│   └── 06-CICD流程.md      # GitHub Actions自动合并到main分支
├── rules/                  # 约束定义（核心约束）
│   ├── project/            # 项目级约束
│   │   ├── 01-架构约束.md
│   │   ├── 02-编码约束.md
│   │   ├── 03-测试约束.md
│   │   ├── 04-部署约束.md
│   │   ├── 05-安全约束.md
│   │   ├── 06-性能约束.md
│   │   ├── 07-错误处理约束.md
│   │   ├── 08-代码质量约束.md
│   │   ├── 09-文档约束.md
│   │   └── 10-变更管理约束.md
│   ├── coding/             # 编码规范
│   │   ├── 01-typescript规范.md
│   │   ├── 02-组件规范.md
│   │   ├── 03-API规范.md
│   │   ├── 04-样式规范.md
│   │   ├── 05-服务层规范.md
│   │   ├── 06-队列层规范.md
│   │   ├── 07-工具层规范.md
│   │   ├── 08-测试规范.md
│   │   ├── 09-代码格式化.md
│   │   └── 10-Git规范.md
│   └── architecture/       # 架构约束
│       ├── 11-系统架构约束.md
│       ├── 12-组件交互约束.md
│       ├── 13-数据流约束.md
│       ├── 14-外部依赖约束.md
│       ├── 15-扩展性约束.md
│       ├── 16-安全架构约束.md
│       ├── 17-可观测性约束.md
│       ├── 18-部署架构约束.md
│       ├── 19-容错架构约束.md
│       ├── 20-版本兼容性约束.md
│       ├── 21-性能架构约束.md
│       └── 22-合规约束.md
└── knowledge/              # 知识库
    └── 技术决策记录.md     # 关键技术决策记录
```

## 完整流程闭环

```
User Input → AGENTS.md → 01-任务分析 → 02-Agent选择 → agents/* → rules/* → 03-代码实现 → 04-测试验证 → 05-代码提交 → 06-CICD → 部署完成
```

## 约束文档导航

### 项目级约束

| 文档 | 路径 | 主要内容 |
|------|------|----------|
| 架构约束总览 | `rules/project/01-架构约束.md` | 架构分层、模块划分 |
| 编码约束总览 | `rules/project/02-编码约束.md` | TypeScript、组件、API规范 |
| 测试约束总览 | `rules/project/03-测试约束.md` | 测试框架、覆盖率、隔离性 |
| 部署约束 | `rules/project/04-部署约束.md` | 环境要求、配置管理、进程管理 |
| 安全约束 | `rules/project/05-安全约束.md` | 输入验证、API安全、文件安全 |
| 性能约束 | `rules/project/06-性能约束.md` | 响应时间、并发处理、资源使用 |
| 错误处理约束 | `rules/project/07-错误处理约束.md` | 错误分类、日志、重试策略 |
| 代码质量约束 | `rules/project/08-代码质量约束.md` | 代码审查、CI/CD检查 |
| 文档约束 | `rules/project/09-文档约束.md` | 代码文档、项目文档 |
| 变更管理约束 | `rules/project/10-变更管理约束.md` | 变更流程、回滚策略 |

### 编码规范

| 文档 | 路径 | 主要内容 |
|------|------|----------|
| TypeScript规范 | `rules/coding/01-typescript规范.md` | 配置、类型定义、变量声明 |
| 组件规范 | `rules/coding/02-组件规范.md` | Server/Client Components、Hooks |
| API规范 | `rules/coding/03-API规范.md` | Route Handlers、响应格式、错误处理 |
| 样式规范 | `rules/coding/04-样式规范.md` | Tailwind CSS 4配置、主题定义 |
| 服务层规范 | `rules/coding/05-服务层规范.md` | 服务类设计、依赖注入 |
| 队列层规范 | `rules/coding/06-队列层规范.md` | Queue和Worker配置 |
| 工具层规范 | `rules/coding/07-工具层规范.md` | 工具函数、配置管理 |
| 测试规范 | `rules/coding/08-测试规范.md` | 测试文件命名、编写规范 |
| 代码格式化 | `rules/coding/09-代码格式化.md` | Prettier、ESLint配置 |
| Git规范 | `rules/coding/10-Git规范.md` | 提交信息、分支管理 |

### 架构约束

| 文档 | 路径 | 主要内容 |
|------|------|----------|
| 系统架构 | `rules/architecture/11-系统架构约束.md` | 分层单体架构、模块划分 |
| 组件交互 | `rules/architecture/12-组件交互约束.md` | 前后端组件交互 |
| 数据流 | `rules/architecture/13-数据流约束.md` | 请求流程、数据存储 |
| 外部依赖 | `rules/architecture/14-外部依赖约束.md` | 外部服务、版本约束 |
| 扩展性 | `rules/architecture/15-扩展性约束.md` | 水平扩展、功能扩展 |
| 安全架构 | `rules/architecture/16-安全架构约束.md` | 网络安全、输入安全 |
| 可观测性 | `rules/architecture/17-可观测性约束.md` | 日志、监控、追踪 |
| 部署架构 | `rules/architecture/18-部署架构约束.md` | 容器化、进程管理 |
| 容错架构 | `rules/architecture/19-容错架构约束.md` | 故障处理、降级策略 |
| 版本兼容 | `rules/architecture/20-版本兼容性约束.md` | Node.js、浏览器兼容 |
| 性能架构 | `rules/architecture/21-性能架构约束.md` | 缓存、资源优化 |
| 合规约束 | `rules/architecture/22-合规约束.md` | 数据隐私、内容安全 |

## Agent角色导航

### 开发类Agent

| Agent | 路径 | 职责 |
|-------|------|------|
| 开发Agent | `agents/dev-agent.md` | 实现功能、编写代码 |
| 前端UI Agent | `agents/frontend-agent.md` | 页面开发、组件实现、交互设计 |
| Node.js后端Agent | `agents/backend-agent.md` | API开发、服务实现、队列处理 |

### 质量保障类Agent

| Agent | 路径 | 职责 |
|-------|------|------|
| 测试Agent | `agents/test-agent.md` | 编写测试、验证功能 |
| 审查Agent | `agents/review-agent.md` | 代码审查、质量保证 |

### 运维类Agent

| Agent | 路径 | 职责 |
|-------|------|------|
| 部署Agent | `agents/deploy-agent.md` | 部署应用、运维管理 |
| 运维Agent | `agents/ops-agent.md` | 监控系统、处理问题 |

## 流程导航

```
01-任务分析 → 02-Agent选择 → 03-代码实现 → 04-测试验证 → 05-代码提交 → 06-CICD
```

| 阶段 | 路径 | 核心动作 |
|------|------|----------|
| 流程概览 | `workflows/00-流程概览.md` | 了解完整流程闭环 |
| 任务分析 | `workflows/01-任务分析.md` | 识别任务类型、类别、优先级 |
| Agent选择 | `workflows/02-Agent选择.md` | 根据任务类型选取对应Agent |
| 代码实现 | `workflows/03-代码实现.md` | 编写代码、遵循规范、TDD开发 |
| 测试验证 | `workflows/04-测试验证.md` | Lint → TypeCheck → Build → Test → 接口验证 |
| 代码提交 | `workflows/05-代码提交.md` | 自动完善提交信息、推送到dev分支 |
| CICD流程 | `workflows/06-CICD流程.md` | GitHub Actions自动合并到main分支 |

## 约束优先级

| 优先级 | 说明 | 示例 |
|--------|------|------|
| P0 | 必须遵守，违反将导致严重问题 | 安全约束、类型安全、错误处理 |
| P1 | 建议遵守，违反将影响代码质量 | 编码规范、测试覆盖率、代码审查 |
| P2 | 可选遵守，违反将影响开发效率 | 代码格式化、命名规范 |

## 约束变更流程

1. 提出变更建议（Issue或PR）
2. 架构评审（核心约束）或团队讨论（一般约束）
3. 更新约束文档
4. 通知所有开发人员
5. 更新相关代码（如有必要）

## 相关文档

- [AGENTS.md](../AGENTS.md) - 开发流程入口
- [PRD文档](../docs/PRD.md) - 产品需求文档
- [TDD文档](../docs/TDD.md) - 测试驱动开发文档
- [技术选型文档](../docs/技术选型文档.md) - 技术选型和边界分析