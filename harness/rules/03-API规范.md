# 编码规范 - API规范

## Route Handlers规范

- **文件命名**: 使用`route.ts`作为API路由文件
- **HTTP方法**: 使用`GET`/`POST`/`PUT`/`DELETE`函数
- **参数验证**: 使用Zod或类似库验证请求参数
- **错误处理**: 使用try-catch包裹所有异步操作

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const job = await queue.add('generate', body);
    
    return NextResponse.json({ jobId: job.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## 响应格式规范

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
```

## 错误处理规范

| HTTP状态码 | 使用场景 |
|------------|----------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

**相关规范**: [组件规范](02-组件规范.md) | [样式规范](04-样式规范.md)