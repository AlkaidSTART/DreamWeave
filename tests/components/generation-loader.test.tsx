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

  it("shows the current phase and estimated progress when no explicit progress is provided", () => {
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
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByText("正在生成图像")).toBeInTheDocument();
    expect(screen.getByRole("status").getAttribute("aria-label")).toMatch(
      /当前进度 [1-9]\d?%/,
    );
  });

  it("renders real-time progress explicitly when progress prop is provided", () => {
    const { rerender } = render(
      <GenerationLoader
        phases={["正在构思画面", "正在生成图像", "正在润色细节", "即将完成"]}
        showProgress
        progress={45}
      />,
    );

    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAccessibleName(
      "正在生成图像，当前进度 45%",
    );

    rerender(
      <GenerationLoader
        phases={["正在构思画面", "正在生成图像", "正在润色细节", "即将完成"]}
        showProgress
        progress={85}
      />,
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAccessibleName(
      "即将完成，当前进度 85%",
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
