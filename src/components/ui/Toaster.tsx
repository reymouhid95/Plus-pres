"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type Kind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  kind: Kind;
};

let sequence = 0;
let items: ToastItem[] = [];
const listeners = new Set<(next: ToastItem[]) => void>();

function emit() {
  const snapshot = [...items];
  for (const listener of listeners) listener(snapshot);
}

export function toast(message: string, kind: Kind = "info") {
  const id = ++sequence;
  items = [...items, { id, message, kind }];
  emit();

  setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, 4200);
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const TONE = {
  success: "text-sage",
  error: "text-accent",
  info: "text-gold",
} as const;

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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:top-5 sm:right-5 sm:bottom-auto sm:items-end"
    >
      {toasts.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <div
            key={item.id}
            className="card card-solid animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 px-4 py-3 shadow-lift"
          >
            <Icon className={`mt-0.5 size-5 shrink-0 ${TONE[item.kind]}`} strokeWidth={2} />
            <p className="flex-1 text-sm leading-snug text-fg">{item.message}</p>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => {
                items = items.filter((entry) => entry.id !== item.id);
                emit();
              }}
              className="-mr-1 rounded-full p-1 text-muted transition hover:bg-fg/10 hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
