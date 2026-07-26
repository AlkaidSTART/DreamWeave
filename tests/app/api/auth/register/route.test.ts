import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

const { prisma } = await import("@/lib/prisma");

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findFirst).mockReset();
    vi.mocked(prisma.user.create).mockReset();
  });

  it("should register a new user with valid credentials", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: "user-1" } as never);

    const response = await POST(createRequest({
      username: "newuser",
      password: "password123",
      email: "newuser@example.com",
    }) as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  it("should reject short usernames", async () => {
    const response = await POST(createRequest({
      username: "ab",
      password: "password123",
    }) as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("should reject duplicate users", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "existing-user" } as never);

    const response = await POST(createRequest({
      username: "existing",
      password: "password123",
    }) as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe("用户名或邮箱已被注册");
  });
});
