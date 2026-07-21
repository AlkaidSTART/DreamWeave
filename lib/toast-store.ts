export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts() {
  return [...toasts];
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
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
