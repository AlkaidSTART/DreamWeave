# 编码规范 - TypeScript规范

## 配置要求

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "useUnknownInCatchVariables": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 类型定义规范

- **优先使用接口**: 使用`interface`定义对象类型，`type`定义联合类型和工具类型
- **避免any**: 禁止使用`any`类型，使用`unknown`替代
- **类型守卫**: 使用类型守卫缩小类型范围
- **泛型约束**: 泛型必须有明确的约束

```typescript
interface User {
  id: string;
  name: string;
}

type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

## 变量声明

- **const优先**: 优先使用`const`，仅在需要重新赋值时使用`let`
- **禁止var**: 禁止使用`var`声明变量
- **解构赋值**: 优先使用解构赋值提取对象/数组属性

```typescript
const { name, age } = user;
const [first, second] = array;
```

---

**相关规范**: [组件规范](02-组件规范.md) | [API规范](03-API规范.md)