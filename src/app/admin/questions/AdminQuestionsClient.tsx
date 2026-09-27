"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, FileUp, Download, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

type Question = {
  id: string;
  level: number;
  text: string;
  options: string[];
  category: string | null;
  active: boolean;
  createdAt: string | Date;
};

type FormData = {
  level: number;
  text: string;
  options: string[];
  category: string;
  active: boolean;
};

const CATEGORIES = ["Se découvrir", "Rigoler", "Connexion", "Devine ma réponse"] as const;

export default function AdminQuestionsClient({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    level: 1,
    text: "",
    options: ["", ""],
    category: CATEGORIES[0],
    active: true,
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);

  function resetForm() {
    setForm({ level: 1, text: "", options: ["", ""], category: CATEGORIES[0], active: true });
  }

  async function fetchQuestions() {
    const res = await fetch("/api/admin/questions");
    if (res.ok) setQuestions(await res.json());
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast(editingId ? "Question modifiée." : "Question créée.", "success");
      setEditingId(null);
      resetForm();
      fetchQuestions();
    } else {
      const data = await res.json();
      toast(data.error ?? "Erreur.", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Question supprimée.", "success");
      fetchQuestions();
    } else {
      toast("Erreur.", "error");
    }
  }

  async function handleImport(event: React.FormEvent) {
    event.preventDefault();
    if (!importFile) return;
    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("replace", String(replaceMode));
    const res = await fetch("/api/admin/import", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      toast(`${data.created} créées, ${data.updated} mises à jour. ${data.errors.length} erreurs.`, "success");
      if (data.errors.length) console.warn(data.errors);
      fetchQuestions();
      setImportFile(null);
    } else {
      toast("Import échoué.", "error");
    }
  }

  async function handleExport() {
    const res = await fetch("/api/admin/questions");
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `questions-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Export JSON prêt.", "success");
    }
  }

  function startEdit(q: Question) {
    setEditingId(q.id);
    setForm({
      level: q.level,
      text: q.text,
      options: [...q.options],
      category: q.category ?? CATEGORIES[0],
      active: q.active,
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16">
      <header className="flex items-center justify-between gap-3 py-5 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold text-fg">Gestion des questions</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download className="size-4" />
            Export JSON
          </button>
          <button onClick={() => setEditingId("new")} className="btn btn-primary btn-sm">
            <Plus className="size-4" />
            Nouvelle
          </button>
        </div>
      </header>

      {editingId && (
        <section className="card p-6 animate-fade-up" data-testid="question-form">
          <h2 className="font-display text-lg font-semibold text-fg mb-4">
            {editingId === "new" ? "Nouvelle question" : "Modifier la question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Niveau</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                  className="input"
                >
                  <option value={1}>1 — Découverte</option>
                  <option value={2}>2 — Complicité</option>
                  <option value={3}>3 — Connexion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Question</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={3}
                className="input w-full"
                placeholder="Texte de la question..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Réponses (2 min, 6 max)</label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...form.options];
                        next[i] = e.target.value;
                        setForm({ ...form, options: next });
                      }}
                      className="input flex-1"
                      placeholder={`Réponse ${i + 1}`}
                    />
                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, options: form.options.filter((_, j) => j !== i) })}
                        className="btn btn-ghost btn-sm text-accent"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
                {form.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, options: [...form.options, ""] })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus className="size-4" /> Ajouter une réponse
                  </button>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="size-4 accent-accent"
              />
              <span className="text-sm text-fg">Active (visible dans les parties)</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn btn-primary">
                <Save className="size-4" /> {editingId === "new" ? "Créer" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => { setEditingId(null); resetForm(); }}
                className="btn btn-secondary"
              >
                <X className="size-4" /> Annuler
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card mt-6 p-4 animate-fade-up">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-semibold text-fg">Import / Export</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={replaceMode}
                onChange={(e) => setReplaceMode(e.target.checked)}
                className="size-4 accent-accent"
              />
              Remplacer (upsert par id)
            </label>
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="input text-sm"
            />
            <button onClick={handleImport} disabled={!importFile} className="btn btn-primary btn-sm">
              <FileUp className="size-4" /> Importer
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 animate-fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="pb-2 w-10">ID</th>
                <th className="pb-2">Question</th>
                <th className="pb-2 w-28">Niveau</th>
                <th className="pb-2 w-32">Catégorie</th>
                <th className="pb-2 w-20">Active</th>
                <th className="pb-2 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-line/50 hover:bg-canvas/50">
                  <td className="py-3 font-mono text-xs text-muted">{q.id.slice(0, 8)}…</td>
                  <td className="py-3 max-w-xs truncate text-fg">{q.text}</td>
                  <td className="py-3">
                    <span className={`badge ${q.level === 1 ? "badge-gold" : q.level === 2 ? "badge-accent" : "badge-sage"}`}>
                      Niveau {q.level}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{q.category ?? "—"}</td>
                  <td className="py-3">
                    <span className={q.active ? "text-sage" : "text-muted"}>
                      {q.active ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(q)}
                        className="btn btn-ghost btn-sm"
                        aria-label="Modifier"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="btn btn-ghost btn-sm text-accent"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}