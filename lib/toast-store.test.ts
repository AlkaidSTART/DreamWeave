import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addToast,
  removeToast,
  subscribe,
  toast,
  clearToasts,
} from "@/lib/toast-store";

describe("toast-store", () => {
  beforeEach(() => {
    clearToasts();
  });
  it("adds a toast and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    toast.success("保存成功");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toHaveLength(1);

    unsubscribe();
  });

  it("removes a toast by id", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    const id = addToast("info", "提示");

    removeToast(id);
    expect(listener.mock.calls[listener.mock.calls.length - 1][0]).toHaveLength(0);

    unsubscribe();
  });

  it("exposes typed helper functions", () => {
    const id = toast.error("错误");
    expect(typeof id).toBe("string");
  });
});
