import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenerationLoader } from "@/components/generation-loader";

vi.mock("@/lib/home-animation-utils", () => ({
  prefersReducedMotion: () => true,
}));

describe("GenerationLoader", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the current phase and estimated progress", () => {
    vi.useFakeTimers();

    render(
      <GenerationLoader
        phases={["正在构思画面", "正在生成图像", "正在润色细节", "即将完成"]}
        showProgress
      />,
    );

    expect(screen.getByRole("status")).toHaveAccessibleName(
      "正在构思画面，当前进度 0%",
    );
    expect(screen.getByText("0%")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("正在生成图像")).toBeInTheDocument();
    expect(screen.getByRole("status").getAttribute("aria-label")).toMatch(
      /当前进度 [1-9]\d?%/,
    );
  });

  it("cleans up its progress timer when unmounted", () => {
    vi.useFakeTimers();

    const { unmount } = render(
      <GenerationLoader phases={["分析", "生成"]} showProgress />,
    );

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
