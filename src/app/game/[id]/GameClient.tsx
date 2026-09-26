"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const LEVEL_META: Record<number, { label: string; color: string }> = {
  1: { label: "Découverte", color: "#C7973E" },
  2: { label: "Complicité", color: "#C77B87" },
  3: { label: "Connexion", color: "#7C8B6F" },
};

type RoundState = {
  id: string;
  level: number;
  status: "pending" | "revealed";
  matched: boolean | null;
  question: { id: string; text: string; options: string[] };
  myAnswer: string | null;
  partnerAnswered: boolean;
  answers: { userId: string; choice: string }[];
};

type SessionState = {
  id: string;
  code: string;
  status: "waiting" | "active" | "completed";
  currentLevel: number;
  turnUserId: string | null;
  host: { id: string; displayName: string; avatarEmoji: string };
  partner: { id: string; displayName: string; avatarEmoji: string } | null;
  currentRound: RoundState | null;
  compatibility: { percentage: number; totalRounds: number; matchedRounds: number; byLevel: Record<number, number> };
};

export default function GameClient({ sessionId, userId }: { sessionId: string; userId: string }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [answering, setAnswering] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchState = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (res.ok) setState(await res.json());
  }, [sessionId]);

  useEffect(() => {
    fetchState();
    pollRef.current = setInterval(fetchState, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchState]);

  if (!state) return <main className="flex min-h-screen items-center justify-center text-plum/50">Chargement...</main>;

  const partnerName = state.host.id === userId ? state.partner : state.host;
  const isMyTurn = state.turnUserId === userId;
  const meta = LEVEL_META[state.currentLevel] ?? LEVEL_META[1];

  async function draw() {
    setDrawing(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/draw`, { method: "POST" });
    const data = await res.json();
    setDrawing(false);
    if (!res.ok) return setError(data.error);
    fetchState();
  }

  async function answer(choice: string) {
    const roundId = state?.currentRound?.id;
    if (!roundId) return;
    setAnswering(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, choice }),
    });
    const data = await res.json();
    setAnswering(false);
    if (!res.ok) return setError(data.error);
    fetchState();
  }

  async function nextLevel() {
    await fetch(`/api/sessions/${sessionId}/level`, { method: "POST" });
    fetchState();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-10">
      <div className="flex w-full items-center justify-between">
        <Link href="/dashboard" className="text-sm text-plum/50">
          ← Parties
        </Link>
        <span className="text-sm font-medium text-plum/60">
          Compatibilité : <span style={{ color: meta.color }}>{state.compatibility.percentage}%</span>
        </span>
      </div>

      {state.status === "waiting" && (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="font-display text-2xl text-plum">En attente de votre partenaire</p>
          <p className="mt-2 text-sm text-plum/60">Partagez ce code pour qu'iel rejoigne la partie :</p>
          <div className="mt-5 rounded-2xl bg-card px-8 py-4 font-display text-3xl tracking-[0.3em] text-rose-deep shadow-sm">
            {state.code}
          </div>
        </div>
      )}

      {state.status !== "waiting" && (
        <>
          <div className="mt-6 flex items-center gap-2">
            {[1, 2, 3].map((lvl) => (
              <span
                key={lvl}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: lvl === state.currentLevel ? LEVEL_META[lvl].color : "transparent",
                  color: lvl === state.currentLevel ? "#FFFDFB" : "#36243066",
                  border: lvl !== state.currentLevel ? "1px solid #36243022" : "none",
                }}
              >
                {LEVEL_META[lvl].label}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-plum/50">avec {partnerName?.avatarEmoji} {partnerName?.displayName}</p>

          {state.status === "completed" ? (
            <div className="mt-14 flex flex-col items-center text-center">
              <p className="font-display text-2xl text-plum">Partie terminée 🎉</p>
              <p className="mt-3 text-5xl font-display" style={{ color: meta.color }}>
                {state.compatibility.percentage}%
              </p>
              <p className="mt-2 text-sm text-plum/60">
                {state.compatibility.matchedRounds} alignements sur {state.compatibility.totalRounds} questions
              </p>
              <div className="mt-6 flex flex-col gap-1 text-sm text-plum/60">
                {Object.entries(state.compatibility.byLevel).map(([lvl, pct]) => (
                  <span key={lvl}>
                    {LEVEL_META[Number(lvl)].label} : {pct}%
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 w-full">
              {!state.currentRound || state.currentRound.status === "revealed" ? (
                <div className="flex flex-col items-center">
                  {state.currentRound?.status === "revealed" && (
                    <div className="mb-6 w-full rounded-xl2 bg-card p-6 text-center shadow-sm">
                      <p className="text-sm text-plum/50">{state.currentRound.question.text}</p>
                      <p className={`mt-3 font-display text-xl ${state.currentRound.matched ? "text-sage" : "text-rose-deep"}`}>
                        {state.currentRound.matched ? "Vous êtes alignés ✓" : "Réponses différentes"}
                      </p>
                      <div className="mt-3 flex justify-center gap-4 text-sm text-plum/70">
                        {state.currentRound.answers.map((a) => (
                          <span key={a.userId}>
                            {a.userId === userId ? "Vous" : partnerName?.displayName} : {a.choice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {isMyTurn ? (
                    <button
                      onClick={draw}
                      disabled={drawing}
                      className="w-full rounded-2xl py-4 font-medium text-cream disabled:opacity-60"
                      style={{ background: meta.color }}
                    >
                      {drawing ? "Tirage..." : "Tirer une carte"}
                    </button>
                  ) : (
                    <p className="text-sm text-plum/50">C'est au tour de {partnerName?.displayName} de tirer une carte.</p>
                  )}
                  {state.currentLevel < 3 && state.compatibility.totalRounds > 0 && (
                    <button onClick={nextLevel} className="mt-4 text-sm text-plum/50 underline">
                      Passer au niveau suivant
                    </button>
                  )}
                  {state.currentLevel === 3 && state.compatibility.totalRounds > 0 && (
                    <button onClick={nextLevel} className="mt-4 text-sm text-plum/50 underline">
                      Terminer la partie
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl2 bg-card p-6 shadow-sm">
                  <p className="font-display text-lg text-plum">{state.currentRound.question.text}</p>
                  {state.currentRound.myAnswer ? (
                    <p className="mt-4 text-sm text-plum/60">
                      {state.currentRound.partnerAnswered
                        ? "Calcul du résultat..."
                        : `En attente de ${partnerName?.displayName}...`}
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-2">
                      {state.currentRound.question.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => answer(opt)}
                          disabled={answering}
                          className="rounded-xl border border-plum/15 px-4 py-3 text-left text-plum hover:border-rose disabled:opacity-60"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && <p className="mt-4 text-sm text-rose-deep">{error}</p>}
    </main>
  );
}
