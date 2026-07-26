import { describe, it, expect, vi } from "vitest";
import { PromptService } from "@/src/services/PromptService";

describe("PromptService", () => {
  const service = new PromptService();

  it("should refine text-to-image prompt with Agnes structure", async () => {
    const result = await service.refine("一只猫", "text-to-image");
    expect(result).toContain("一只猫");
    expect(result).toContain("电影级写实风格");
    expect(result).toContain("超高细节");
  });

  it("should not duplicate existing phrases", async () => {
    const result = await service.refine(
      "一只猫，电影级写实风格，超高细节",
      "text-to-image",
    );
    expect(result).toContain("一只猫");
    expect((result.match(/电影级写实风格/g) ?? []).length).toBe(1);
    expect((result.match(/超高细节/g) ?? []).length).toBe(1);
  });

  it("should refine image-to-image prompt with four-part structure", async () => {
    const result = await service.refine("改为赛博朋克风格", "image-to-image");
    expect(result).toContain("改变要求：改为赛博朋克风格");
    expect(result).toContain("需要添加或移除的元素：");
    expect(result).toContain("需要保留的元素：");
    expect(result).toContain("保留原图主体结构");
  });

  it("should include skill template as style/scene for image-to-image", async () => {
    const result = await service.refine(
      "改为赛博朋克风格",
      "image-to-image",
      "anime style illustration, {prompt}, vibrant colors",
    );
    expect(result).toContain("改变要求：改为赛博朋克风格");
    expect(result).toContain("新风格/场景：");
    expect(result).toContain("anime style illustration");
  });

  it("should apply skill template for text-to-image", async () => {
    const result = await service.refine(
      "一只猫",
      "text-to-image",
      "anime style illustration, {prompt}, vibrant colors",
    );
    expect(result).toContain("anime style illustration");
    expect(result).toContain("一只猫");
  });

  it("should not add photorealistic phrases for illustration skill type", async () => {
    const result = await service.refine(
      "一只猫",
      "text-to-image",
      "anime style illustration, {prompt}, vibrant colors",
      "illustration",
    );
    expect(result).toContain("anime style illustration");
    expect(result).toContain("一只猫");
    expect(result).not.toContain("电影级写实风格");
    expect(result).toContain("超高细节");
  });

  it("should keep photorealistic phrases for photography skill type", async () => {
    const result = await service.refine(
      "一只猫",
      "text-to-image",
      "professional portrait photography, {prompt}",
      "photography",
    );
    expect(result).toContain("professional portrait photography");
    expect(result).toContain("电影级写实风格");
    expect(result).toContain("超高细节");
  });

  it("should return empty prompt as is", async () => {
    const result = await service.refine("  ", "text-to-image");
    expect(result.trim()).toBe("");
  });

  it("should polish text-to-image prompt via Agnes chat", async () => {
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.IMAGE_GENERATION_API_KEY;
    const originalUrl = process.env.IMAGE_GENERATION_API_URL;
    process.env.IMAGE_GENERATION_API_KEY = "test-key";
    process.env.IMAGE_GENERATION_API_URL = "https://apihub.agnes-ai.com/v1/images/generations";

    let requestBody: unknown;
    globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
      requestBody = JSON.parse((init as RequestInit).body as string);
      return {
        ok: true,
        text: vi.fn().mockResolvedValue(""),
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "一只毛茸茸的小猫在青翠草地上嬉戏，午后柔和阳光洒落，细腻毛发质感，温暖治愈氛围，高细节插画风格" } }],
        }),
      } as unknown as Response;
    });

    const result = await service.polish("一只猫", "text-to-image");
    expect(result).toContain("小猫");
    expect(JSON.stringify(requestBody)).toContain("提示词工程师");

    globalThis.fetch = originalFetch;
    process.env.IMAGE_GENERATION_API_KEY = originalKey;
    process.env.IMAGE_GENERATION_API_URL = originalUrl;
  });

  it("should skip LLM polish for image-to-image", async () => {
    const result = await service.polish("改为赛博朋克风格", "image-to-image");
    expect(result).toContain("改变要求：改为赛博朋克风格");
  });
});
