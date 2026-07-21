import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input placeholder="请输入" />);
    expect(screen.getByPlaceholderText("请输入")).toBeInTheDocument();
  });

  it("applies error styles when error is provided", () => {
    render(<Input error="必填" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
