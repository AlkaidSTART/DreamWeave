# Dreamweave AI 生图平台 - 测试驱动开发文档 (TDD)

## 1. 测试策略

### 1.1 测试分层

| 测试层级 | 范围 | 工具 | 覆盖率目标 |
|----------|------|------|------------|
| 单元测试 | 函数/模块级 | Jest/Vitest | 80%+ |
| 集成测试 | API/服务级 | Supertest | 核心流程覆盖 |
| E2E测试 | 端到端流程 | Playwright | 关键用户路径 |

### 1.2 测试环境

- **测试数据库**: 使用 ioredis-mock 模拟 Redis
- **Mock外部服务**: 使用 MSW 拦截外部 API 请求
- **测试隔离**: 每个测试用例独立，使用 beforeEach/afterEach 清理

### 1.3 测试类型

| 类型 | 说明 |
|------|------|
| 功能测试 | 验证功能是否符合需求 |
| 边界测试 | 验证异常/边界情况 |
| 性能测试 | 验证并发处理能力 |
| 安全测试 | 验证安全防护措施 |

---

## 2. 单元测试

### 2.1 提示词服务测试

**文件**: `src/services/prompt-service.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `refinePrompt_should_return_refined_prompt` | 正常提示词润色 | 返回优化后的提示词 |
| `refinePrompt_should_handle_empty_input` | 空提示词 | 返回默认提示词 |
| `refinePrompt_should_handle_long_input` | 超长提示词(>1000字) | 截断并优化 |
| `refinePrompt_should_handle_special_characters` | 特殊字符提示词 | 正确处理不报错 |
| `refinePrompt_should_return_original_on_api_failure` | API失败时 | 返回原始提示词 |

### 2.2 Skill服务测试

**文件**: `src/skills/index.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `getSkills_should_return_all_skills` | 获取所有模板 | 返回完整模板列表 |
| `getSkillById_should_return_matching_skill` | 按ID获取模板 | 返回指定模板 |
| `getSkillById_should_return_null_for_nonexistent` | 获取不存在的模板 | 返回null |
| `applySkillTemplate_should_apply_template_to_prompt` | 应用模板到提示词 | 返回合并后的提示词 |
| `applySkillTemplate_should_handle_missing_placeholder` | 模板无占位符 | 返回完整模板 |
| `applySkillTemplate_should_return_original_on_invalid_skill` | 无效模板ID | 返回原始提示词 |

### 2.3 队列服务测试

**文件**: `src/queue/processor.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `processJob_should_handle_text_to_image` | 处理文生图任务 | 任务状态变为completed |
| `processJob_should_handle_image_to_image` | 处理图生图任务 | 任务状态变为completed |
| `processJob_should_handle_failed_ai_request` | AI服务失败 | 任务状态变为failed |
| `processJob_should_report_progress` | 任务进度报告 | 正确更新进度 |
| `processJob_should_handle_concurrent_jobs` | 并发任务处理 | 所有任务正确完成 |
| `processJob_should_apply_skill_template` | 应用Skill模板 | 使用模板增强的提示词 |

### 2.4 存储服务测试

**文件**: `src/lib/storage.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `saveImage_should_save_image_to_uploads` | 保存图片到uploads | 文件成功写入 |
| `saveImage_should_create_directory_if_not_exists` | 目录不存在 | 自动创建目录 |
| `saveImage_should_handle_invalid_path` | 无效路径 | 抛出错误 |
| `deleteJobFiles_should_delete_job_directory` | 删除任务文件 | 目录被删除 |
| `deleteJobFiles_should_handle_nonexistent_directory` | 目录不存在 | 不报错 |
| `getImageUrl_should_return_public_url` | 获取图片URL | 返回可访问的URL |

### 2.5 SSE服务测试

**文件**: `src/lib/sse.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `createSSEStream_should_return_readable_stream` | 创建SSE流 | 返回ReadableStream |
| `sendProgressEvent_should_format_correctly` | 发送进度事件 | 正确格式的SSE消息 |
| `sendCompleteEvent_should_format_correctly` | 发送完成事件 | 正确格式的SSE消息 |
| `sendErrorEvent_should_format_correctly` | 发送错误事件 | 正确格式的SSE消息 |

### 2.6 Redis连接测试

**文件**: `src/lib/redis.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `redisConnection_should_connect_successfully` | 正常连接 | 返回Redis实例 |
| `redisConnection_should_handle_connection_failure` | 连接失败 | 抛出错误 |
| `redisConnection_should_retry_on_failure` | 连接重试 | 重试后成功 |

### 2.7 类型定义测试

**文件**: `src/types/index.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `GenerationJob_should_have_required_fields` | Job类型完整性 | 所有必需字段存在 |
| `GeneratedImage_should_have_required_fields` | Image类型完整性 | 所有必需字段存在 |
| `Skill_should_have_required_fields` | Skill类型完整性 | 所有必需字段存在 |
| `jobStatus_should_have_valid_values` | 状态枚举值 | 值在允许范围内 |

---

## 3. 集成测试

### 3.1 生成请求 API 测试

**文件**: `app/api/generate/route.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `POST_generate_should_create_job_for_text_to_image` | 文生图请求 | 返回200和jobId |
| `POST_generate_should_create_job_for_image_to_image` | 图生图请求 | 返回200和jobId |
| `POST_generate_should_validate_type` | 无效类型 | 返回400错误 |
| `POST_generate_should_validate_prompt` | 缺少提示词 | 返回400错误 |
| `POST_generate_should_validate_imageCount` | 无效数量 | 返回400错误 |
| `POST_generate_should_handle_server_error` | 服务器错误 | 返回500错误 |
| `POST_generate_should_include_skillId` | 包含skillId | 任务中包含skillId |

### 3.2 任务状态查询 API 测试

**文件**: `app/api/jobs/[jobId]/route.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `GET_job_should_return_job_status` | 查询存在的任务 | 返回200和任务信息 |
| `GET_job_should_return_404_for_nonexistent` | 查询不存在的任务 | 返回404错误 |
| `GET_job_should_return_progress` | 查询处理中任务 | 返回进度信息 |
| `GET_job_should_return_results` | 查询完成任务 | 返回图片结果 |

### 3.3 SSE实时进度 API 测试

**文件**: `app/api/jobs/[jobId]/stream/route.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `GET_stream_should_return_sse_content_type` | SSE响应头 | Content-Type为text/event-stream |
| `GET_stream_should_stream_progress_events` | 流式进度事件 | 正确格式的SSE消息 |
| `GET_stream_should_return_404_for_nonexistent` | 查询不存在的任务 | 返回404错误 |
| `GET_stream_should_close_on_job_completion` | 任务完成时关闭连接 | 连接正常关闭 |

### 3.4 Skill模板 API 测试

**文件**: `app/api/skills/route.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `GET_skills_should_return_all_skills` | 获取所有模板 | 返回200和模板列表 |
| `GET_skills_should_return_correct_format` | 响应格式 | 包含所有必需字段 |

### 3.5 图片上传 API 测试

**文件**: `app/api/upload/route.test.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `POST_upload_should_upload_image` | 正常上传 | 返回200和图片URL |
| `POST_upload_should_reject_invalid_format` | 无效格式 | 返回400错误 |
| `POST_upload_should_reject_too_large` | 文件过大 | 返回400错误 |
| `POST_upload_should_handle_empty_file` | 空文件 | 返回400错误 |

---

## 4. E2E 测试

### 4.1 文生图流程测试

**文件**: `e2e/text-to-image.spec.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `user_can_generate_image_from_text` | 用户完成文生图流程 | 成功生成图片 |
| `user_can_see_generation_progress` | 显示生成进度 | 进度条正确更新(SSE) |
| `user_can_download_generated_image` | 下载生成的图片 | 下载成功 |
| `user_can_generate_multiple_images` | 生成多张图片 | 正确生成指定数量 |
| `user_sees_error_on_empty_prompt` | 空提示词提交 | 显示错误提示 |
| `user_can_select_skill_template` | 选择Skill模板 | 模板应用到提示词 |

### 4.2 图生图流程测试

**文件**: `e2e/image-to-image.spec.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `user_can_upload_image_and_generate` | 用户完成图生图流程 | 成功生成图片 |
| `user_can_see_original_and_generated` | 对比原图和结果 | 正确展示对比 |
| `user_can_upload_and_generate_with_prompt` | 上传图片+提示词 | 成功生成图片 |
| `user_sees_error_on_invalid_image` | 上传无效图片 | 显示错误提示 |

### 4.3 提示词润色测试

**文件**: `e2e/prompt-refinement.spec.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `user_can_see_refined_prompt` | 显示优化后的提示词 | 正确展示优化结果 |
| `user_can_toggle_refined_prompt` | 切换使用优化提示词 | 切换生效 |

### 4.4 Skill模板测试

**文件**: `e2e/skill-selection.spec.ts`

| 测试用例 | 描述 | 预期结果 |
|----------|------|----------|
| `user_can_select_skill_from_list` | 从列表选择模板 | 模板被选中 |
| `user_can_see_skill_description` | 查看模板描述 | 显示描述信息 |
| `user_can_preview_skill_effect` | 预览模板效果 | 显示预览图 |

---

## 5. 性能测试

### 5.1 并发测试

| 测试场景 | 配置 | 预期结果 |
|----------|------|----------|
| 10并发任务 | 同时提交10个生成任务 | 全部完成，无丢失 |
| 50并发任务 | 同时提交50个生成任务 | 全部完成，无丢失 |
| 100并发任务 | 同时提交100个生成任务 | 队列正常处理，无阻塞 |

### 5.2 响应时间测试

| 测试场景 | 预期响应时间 |
|----------|-------------|
| 提示词润色API | < 1s |
| 任务创建API | < 500ms |
| 任务状态查询API | < 200ms |
| SSE连接建立 | < 100ms |
| 图片上传API | < 500ms |

---

## 6. 安全测试

### 6.1 输入验证测试

| 测试场景 | 输入 | 预期结果 |
|----------|------|----------|
| SQL注入 | `'; DROP TABLE jobs;--` | 被过滤，不执行SQL |
| XSS攻击 | `<script>alert('xss')</script>` | 被转义，不执行脚本 |
| 路径遍历 | `../../etc/passwd` | 被拒绝，返回400 |

### 6.2 文件上传安全测试

| 测试场景 | 输入 | 预期结果 |
|----------|------|----------|
| 恶意文件类型 | `.php` | 被拒绝，返回400 |
| 伪装文件类型 | `.png`但内容是PHP | 被检测，返回400 |
| 超大文件 | > 10MB | 被拒绝，返回400 |

---

## 7. 测试工具配置

### 7.1 Jest 配置示例

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 7.2 MSW Mock 配置示例

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post('/api/ai/image', (req, res, ctx) => {
    return res(ctx.json({ url: '/uploads/test/image.png' }));
  }),
  rest.post('/api/ai/prompt', (req, res, ctx) => {
    return res(ctx.json({ refined: 'Refined prompt' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 7.3 Playwright 配置示例

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

---

## 8. 测试执行流程

### 8.1 开发阶段

```
编写测试 → 运行测试（失败）→ 实现代码 → 运行测试（通过）→ 提交代码
```

### 8.2 CI/CD 阶段

```
代码提交 → 单元测试 → 集成测试 → E2E测试 → 部署
```

### 8.3 测试命令

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行E2E测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage
```

---

## 附录：测试用例统计

| 测试层级 | 测试文件数 | 测试用例数 |
|----------|-----------|-----------|
| 单元测试 | 7 | 30 |
| 集成测试 | 5 | 22 |
| E2E测试 | 4 | 15 |
| 性能测试 | - | 3 |
| 安全测试 | - | 6 |
| **合计** | **16** | **76** |