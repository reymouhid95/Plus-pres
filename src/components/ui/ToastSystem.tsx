"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

let sequence = 0;
let items: { id: number; message: string; kind: ToastKind }[] = [];
const listeners = new Set<(next: { id: number; message: string; kind: ToastKind }[]) => void>();

function emit() {
  const snapshot = [...items];
  for (const listener of listeners) listener(snapshot);
}

function triggerToast(message: string, kind: ToastKind = "info", duration = 4200) {
  const id = ++sequence;
  items = [...items, { id, message, kind }];
  emit();

  if (duration > 0) {
    setTimeout(() => {
      items = items.filter((item) => item.id !== id);
      emit();
    }, duration);
  }
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
} as const;

export function Toaster() {
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    setToasts([...items]);
    return () => listeners.delete(setToasts);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg animate-pop ${
            toast.kind === "success"
              ? "border-success-200 bg-success-50 text-success-900"
              : toast.kind === "error"
              ? "border-error-200 bg-error-50 text-error-900"
              : toast.kind === "warning"
              ? "border-warning-200 bg-warning-50 text-warning-900"
              : "border-primary-200 bg-primary-50 text-primary-900"
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function triggerToast(message: string, kind: ToastKind = "info", duration = 4200) {
  const id = ++sequence;
  items = [...items, { id, message, kind }];
  emit();

  if (duration > 0) {
    setTimeout(() => {
      items = items.filter((item) => item.id !== id);
      emit();
    }, duration);
  }
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
} as const;

export { triggerToast as toast };
export type { ToastKind };