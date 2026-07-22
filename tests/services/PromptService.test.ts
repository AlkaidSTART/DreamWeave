import { describe, it, expect } from "vitest";
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

  it("should return empty prompt as is", async () => {
    const result = await service.refine("  ", "text-to-image");
    expect(result.trim()).toBe("");
  });
});
