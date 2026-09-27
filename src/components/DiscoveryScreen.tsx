"use client";

import { useEffect, useState } from "react";
import { Sparkles, BookOpen, Download, Heart, Camera } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

type DiscoveryScreenProps = {
  sessionId: string;
  duoId: string;
  content: string;
  onSaveMoment?: (moment: { title: string; content: string; questionId?: string }) => Promise<void>;
  onClose: () => void;
};

export default function DiscoveryScreen({ sessionId, duoId, content, onSaveMoment, onClose }: DiscoveryScreenProps) {
  const [saving, setSaving] = useState(false);

  async function handleSaveMoment() {
    setSaving(true);
    try {
      const title = `Notre découverte du ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
      await onSaveMoment?.({ title, content });
      toast("Moment sauvegardé dans votre histoire.", "success");
      onClose();
    } catch {
      toast("Impossible de sauvegarder.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    const text = `Plus Près — Découverte du jour\n\n${content}\n\n---\nPartagé depuis Plus Près`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Copié dans le presse-papiers.", "success");
    } catch {
      toast("Échec de la copie.", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-card overflow-hidden animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <Sparkles className="size-5 text-gold" />
            Découverte du jour
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-sm max-w-none text-fg/90 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-line">
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Download className="size-4" />
              Copier
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveMoment}
              disabled={saving}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin">⟳</span>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Heart className="size-4" />
                  Sauver ce moment
                </>
              )}
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}