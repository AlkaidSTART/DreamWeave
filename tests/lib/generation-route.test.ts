import { describe, expect, it } from "vitest";
import { getGenerationSourceRoute } from "@/lib/generation-route";

describe("getGenerationSourceRoute", () => {
  it("returns the text-to-image creation route", () => {
    expect(getGenerationSourceRoute("text-to-image")).toBe("/text-to-image");
  });

  it("returns the image-to-image creation route", () => {
    expect(getGenerationSourceRoute("image-to-image")).toBe("/image-to-image");
  });
});
