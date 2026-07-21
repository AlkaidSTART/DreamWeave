export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let snapshot: Toast[] = [];
const listeners = new Set<Listener>();

function updateSnapshot() {
  const next = [...toasts];
  if (
    next.length === snapshot.length &&
    next.every((toast, index) => toast === snapshot[index])
  ) {
    return false;
  }
  snapshot = next;
  return true;
}

function emit() {
  if (!updateSnapshot()) return;
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts() {
  return snapshot;
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function clearToasts() {
  toasts = [];
  emit();
}

export function addToast(
  type: ToastType,
  title: string,
  message?: string,
  duration = 5000,
) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  toasts = [...toasts, { id, type, title, message }];
  emit();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export const toast = {
  success: (title: string, message?: string) =>
    addToast("success", title, message),
  error: (title: string, message?: string) =>
    addToast("error", title, message),
  info: (title: string, message?: string) => addToast("info", title, message),
};
