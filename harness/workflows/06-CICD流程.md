# 阶段 06: CICD流程

## 目标

通过GitHub Actions自动执行CI/CD流程，确保代码质量并部署到生产环境。

## 触发条件

- 代码推送到`develop`分支
- Pull Request合并到`develop`分支

## 操作步骤

### GitHub Actions工作流

```yaml
name: CI/CD

on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

jobs:
  ci:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint check
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Build
        run: npm run build
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: Integration tests
        run: npm run test:integration

  cd:
    runs-on: ubuntu-latest
    needs: ci
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Merge to main
        run: |
          git fetch origin main
          git checkout main
          git merge --no-ff develop
          git push origin main
      
      - name: Deploy to production
        run: npm run deploy
```

### CI阶段（持续集成）

| 步骤 | 命令 | 目的 |
|------|------|------|
| 代码检出 | `actions/checkout` | 获取最新代码 |
| Node.js安装 | `actions/setup-node` | 配置Node.js环境 |
| 依赖安装 | `npm ci` | 安装项目依赖 |
| Lint检查 | `npm run lint` | 代码风格检查 |
| 类型检查 | `npm run typecheck` | TypeScript类型检查 |
| 构建验证 | `npm run build` | 生产构建验证 |
| 单元测试 | `npm run test:unit` | 单元测试执行 |
| 集成测试 | `npm run test:integration` | 集成测试执行 |

### CD阶段（持续部署）

| 步骤 | 目的 |
|------|------|
| 合并到main | 将develop分支自动合并到main分支 |
| 部署到生产 | 将main分支部署到生产环境 |

### 自动合并规则

| 条件 | 操作 |
|------|------|
| CI通过 | 自动合并到main分支 |
| CI失败 | 通知开发者，不合并 |
| 有冲突 | 通知开发者解决冲突 |

### 部署验证

部署完成后自动执行：

| 验证项 | 目的 |
|--------|------|
| 健康检查 | 验证服务是否正常运行 |
| 核心功能测试 | 验证核心功能是否正常 |
| API接口测试 | 验证API接口是否正常 |

## 失败处理

### CI失败

1. 查看GitHub Actions日志
2. 定位失败原因
3. 在功能分支修复代码
4. 重新推送代码触发CI

### CD失败

1. 执行回滚操作
2. 通知开发者
3. 分析失败原因
4. 修复后重新部署

## 输出产物

| 产物 | 说明 |
|------|------|
| CI报告 | 持续集成测试结果 |
| CD报告 | 持续部署结果 |
| 部署记录 | 生产环境部署日志 |

## 流程完成

代码成功部署到生产环境，流程闭环完成：

```
User Input → AGENTS.md → 任务分析 → Agent选择 → 代码实现 → 测试验证 → 代码提交 → CI/CD → ✅ 部署完成
```