"use client";

import { useState } from "react";
import { X, Heart, Camera, Image } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

type SaveMomentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; imageUrl?: string; questionId?: string }) => Promise<void>;
  defaultTitle?: string;
  defaultContent?: string;
  questionId?: string;
};

export default function SaveMomentDialog({ isOpen, onClose, onSave, defaultTitle, defaultContent, questionId }: SaveMomentDialogProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(defaultTitle || "");
  const [content, setContent] = useState(defaultContent || "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Seules les images sont acceptées.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("L'image ne doit pas dépasser 5 Mo.", "error");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }

  async function handleSave() {
    if (!title.trim()) {
      toast("Un titre est requis.", "error");
      return;
    }
    setSaving(true);
    try {
      await onSave({ title, content, imageUrl, questionId });
      toast("Moment sauvegardé dans votre histoire.", "success");
      onClose();
    } catch {
      toast("Impossible de sauvegarder.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-card overflow-hidden animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
            <Heart className="size-5 text-accent" />
            Sauver ce moment
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Fermer">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="moment-title" className="block text-sm font-medium text-muted mb-1">
              Titre
            </label>
            <input
              id="moment-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du moment"
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="moment-content" className="block text-sm font-medium text-muted mb-1">
              Texte (optionnel)
            </label>
            <textarea
              id="moment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ce que vous voulez garder de cette expérience..."
              rows={4}
              className="input w-full resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Photo (optionnel)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imageUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-line">
                  <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageUrl(undefined); setImageFile(null); }}
                    className="absolute top-2 right-2 btn btn-ghost btn-sm"
                    aria-label="Supprimer l'image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="btn btn-secondary w-full aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <Camera className="size-8" />
                  <span className="text-sm text-muted">Ajouter une photo</span>
                </label>
              )}
            </div>
          </div>

          {questionId && (
            <input type="hidden" value={questionId} />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line">
          <button onClick={onClose} className="btn btn-secondary" disabled={saving}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving || !title.trim()} className="btn btn-primary">
            {saving ? (
              <>
                <span className="size-4 animate-spin">⟳</span>
                Sauvegarde...
              </>
            ) : (
              <>
                <Heart className="size-4" />
                Sauver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}