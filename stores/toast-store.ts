"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
  ) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (type, title, message, duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, title, message }],
    }));

    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration);
    }

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast("success", title, message),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast("error", title, message),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast("info", title, message),
};
