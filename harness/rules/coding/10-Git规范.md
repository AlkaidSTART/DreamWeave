# 编码规范 - Git规范

## 提交信息规范

使用Conventional Commits格式：

```
<type>(<scope>): <description>

<body>

<footer>
```

**类型**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具更新

**示例**:
```
feat(prompt-service): add prompt refinement logic

- Implement prompt analysis
- Integrate with LLM API
- Add error handling

Closes #123
```

## 分支管理

- `main`: 主分支，生产环境代码
- `develop`: 开发分支，整合所有功能
- `feature/*`: 功能分支，开发新功能
- `bugfix/*`: Bug修复分支
- `hotfix/*`: 紧急修复分支

**流程**:
1. 从`develop`创建功能分支
2. 开发完成后提交Pull Request
3. 代码审查通过后合并到`develop`
4. 测试通过后合并到`main`

---

**相关规范**: [代码格式化](09-代码格式化.md)