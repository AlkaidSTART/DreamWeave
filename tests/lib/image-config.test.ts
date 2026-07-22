import { describe, it, expect } from "vitest";
import {
  resolveImageSize,
  parseImageSize,
  DEFAULT_RATIO,
  DEFAULT_QUALITY,
} from "@/lib/image-config";
import type { ImageRatio, ImageQuality } from "@/lib/types";

describe("image-config", () => {
  it("should return default size for default ratio and quality", () => {
    expect(resolveImageSize(DEFAULT_RATIO, DEFAULT_QUALITY)).toBe("2048x2048");
  });

  it.each([
    ["1:1", "1K", "1024x1024"],
    ["1:1", "4K", "4096x4096"],
    ["16:9", "2K", "2624x1472"],
    ["9:16", "3K", "2208x3936"],
    ["21:9", "4K", "6272x2688"],
  ] as [ImageRatio, ImageQuality, string][])(
    "should resolve %s %s to %s",
    (ratio, quality, expected) => {
      expect(resolveImageSize(ratio, quality)).toBe(expected);
    },
  );

  it("should parse image size into width and height", () => {
    expect(parseImageSize("2624x1472")).toEqual({ width: 2624, height: 1472 });
  });
});
