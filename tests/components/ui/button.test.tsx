import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>点击</Button>);
    expect(screen.getByRole("button", { name: "点击" })).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when loading", () => {
    render(<Button isLoading>加载中</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as child anchor", () => {
    render(
      <Button asChild>
        <a href="/test">链接</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "链接" })).toHaveAttribute(
      "href",
      "/test",
    );
  });
});
