import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast, useToastStore } from "@/stores/toast-store";

describe("toast-store", () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it("adds a toast and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = useToastStore.subscribe((state, prev) => {
      if (state.toasts !== prev.toasts) {
        listener(state.toasts);
      }
    });

    toast.success("保存成功");
    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ title: "保存成功" })]),
    );

    unsubscribe();
  });

  it("removes a toast by id", () => {
    const id = useToastStore.getState().addToast("info", "提示");
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("exposes typed helper functions", () => {
    const id = toast.error("错误");
    expect(typeof id).toBe("string");
  });

  it("clears all toasts", () => {
    toast.success("第一条");
    toast.error("第二条");
    useToastStore.getState().clearToasts();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
