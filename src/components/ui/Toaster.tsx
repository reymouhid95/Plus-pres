"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

let sequence = 0;
let items: ToastItem[] = [];
const listeners = new Set<(next: ToastItem[]) => void>();

function emit(): void {
  const snapshot = [...items];
  for (const listener of listeners) listener(snapshot);
}

export function toast(message: string, kind: ToastKind = "info", duration = 4200): void {
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

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONES: Record<ToastKind, string> = {
  success: "border-sage/40 bg-sage/10 text-sage",
  error: "border-accent/40 bg-accent/10 text-accent",
  info: "border-gold/40 bg-gold/10 text-gold",
};

function dismiss(id: number): void {
  items = items.filter((item) => item.id !== id);
  emit();
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    setToasts([...items]);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift animate-pop ${TONES[item.kind]}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="flex-1 text-sm font-medium">{item.message}</p>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => dismiss(item.id)}
              className="-m-1 rounded-full p-1 opacity-60 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
