"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardCopy,
  Hourglass,
  ListChecks,
  PartyPopper,
  Play,
  RefreshCw,
  Timer,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Skeleton } from "@/components/ui/Skeleton";
import ProgressRing from "@/components/ui/ProgressRing";
import Logo from "@/components/Logo";
import { remainingMs } from "@/lib/timer";
import { levelMeta } from "@/lib/levels";

type RoundState = {
  id: string;
  level: number;
  status: "pending" | "revealed";
  matched: boolean | null;
  startedAt: string | null;
  expiresAt: string | null;
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
  compatibility: {
    percentage: number;
    totalRounds: number;
    matchedRounds: number;
    byLevel: Record<number, number>;
  };
  /** Horodatage serveur : sert à corriger l'horloge locale du navigateur. */
  serverNow: number;
};

export default function GameClient({ sessionId, userId }: { sessionId: string; userId: string }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, forceTick] = useState(0);

  const fetchState = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (res.ok) setState(await res.json());
  }, [sessionId]);

  const hasPendingRound = Boolean(state?.currentRound?.status === "pending");

  // Le compte à rebours se recalcule localement à partir de l'horodatage
  // serveur : aucun message réseau n'est nécessaire entre deux mises à jour.
  useEffect(() => {
    if (!hasPendingRound) return;
    const timer = setInterval(() => forceTick((value) => value + 1), 250);
    return () => clearInterval(timer);
  }, [hasPendingRound]);

  useEffect(() => {
    let disposed = false;
    let failures = 0;
    let source: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (poll || disposed) return;
      poll = setInterval(fetchState, 2500);
    };

    fetchState();

    if (typeof window !== "undefined" && "EventSource" in window) {
      source = new EventSource(`/api/sessions/${sessionId}/stream`);
      source.onopen = () => {
        failures = 0;
      };
      source.onmessage = (event) => {
        failures = 0;
        try {
          const payload = JSON.parse(event.data) as SessionState;
          if (!disposed) setState(payload);
        } catch {
          // Trame illisible : la suivante rattrapera l'état.
        }
      };
      source.onerror = () => {
        failures += 1;
        if (failures >= 3) {
          source?.close();
          startPolling();
        }
      };
    } else {
      startPolling();
    }

    return () => {
      disposed = true;
      source?.close();
      if (poll) clearInterval(poll);
    };
  }, [fetchState, sessionId]);

  if (!state) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-8 h-64 w-full" />
        <Skeleton className="mt-4 h-12 w-full" />
      </main>
    );
  }

  const partner = state.host.id === userId ? state.partner : state.host;
  const partnerName = partner?.displayName ?? "votre partenaire";
  const isMyTurn = state.turnUserId === userId;
  const meta = levelMeta(state.currentLevel);
  const round = state.currentRound;
  const gameCode = state.code;
  // Écart entre l'horloge serveur et celle du navigateur, recalculé à chaque
  // état reçu : le minuteur reste juste même si l'appareil est décalé.
  const clockSkew = state.serverNow - Date.now();
  const remaining = round?.expiresAt
    ? remainingMs(new Date(round.expiresAt), Date.now() + clockSkew)
    : null;
  const timeUp = remaining === 0;

  async function draw() {
    setDrawing(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/draw`, { method: "POST" });
    const data = await res.json();
    setDrawing(false);
    if (!res.ok) {
      setError(data.error);
      toast(data.error ?? "Impossible de tirer une carte.", "error");
      return;
    }
    fetchState();
  }

  async function answer(choice: string) {
    if (!round) return;
    setAnswering(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: round.id, choice }),
    });
    const data = await res.json();
    setAnswering(false);
    if (!res.ok) {
      setError(data.error);
      toast(data.error ?? "Envoi impossible.", "error");
      return;
    }
    fetchState();
  }

  async function nextLevel() {
    await fetch(`/api/sessions/${sessionId}/level`, { method: "POST" });
    fetchState();
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      toast("Code copié dans le presse-papiers.", "success");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast("Copie impossible — notez le code.", "error");
    }
  }

  /* ——————————————————————
     En attente de partenaire
     —————————————————————— */
  if (state.status === "waiting") {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-14">
        <TopBar code={state.code} copied={copied} onCopy={copyCode} />

        <section className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
          <span className="grid size-16 place-items-center rounded-full gradient-brand-soft">
            <Hourglass className="size-7 text-accent" strokeWidth={1.8} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold text-fg">
            En attente de {partnerName}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Partage ce code&nbsp;: la partie démarre dès que l&apos;autre joueur a rejoint.
          </p>

          <button
            type="button"
            onClick={copyCode}
            data-testid="session-code"
            className="card mt-8 flex items-center gap-4 px-8 py-5 transition hover:border-accent/45 animate-pop"
            aria-label="Copier le code de la partie"
          >
            <span className="font-display text-4xl tracking-[0.3em] text-accent select-all">
              {state.code}
            </span>
            <span className="text-muted">{copied ? <Check className="size-5 text-sage" /> : <ClipboardCopy className="size-5" />}</span>
          </button>

          <span className="badge badge-accent mt-5 animate-pulse-ring">
            <span className="dot" />
            Ouverture de la partie…
          </span>

          <p className="mt-10 text-xs text-muted">
            Cette page se met à jour toute seule&nbsp;: reste sur cet écran.
          </p>
        </section>
      </main>
    );
  }

  /* ——————————————————————
     Partie terminée
     —————————————————————— */
  if (state.status === "completed") {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-14">
        <TopBar code={state.code} copied={copied} onCopy={copyCode} />

        <section className="mt-8 flex flex-col items-center text-center animate-fade-up">
          <span className="grid size-14 place-items-center rounded-full gradient-brand-soft">
            <PartyPopper className="size-6 text-gold" strokeWidth={1.8} />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-fg">Partie terminée</h1>
          <p className="mt-1.5 text-sm text-muted">avec {partner?.avatarEmoji} {partnerName}</p>

          <div className="card mt-7 flex w-full flex-col items-center gap-5 p-7">
            <ProgressRing value={state.compatibility.percentage} size={132} stroke={11} />
            <p className="text-sm text-muted">
              <span className="font-semibold text-fg">{state.compatibility.matchedRounds}</span>{" "}
              alignements sur{" "}
              <span className="font-semibold text-fg">{state.compatibility.totalRounds}</span>{" "}
              questions
            </p>

            <div className="w-full space-y-3">
              {Object.entries(state.compatibility.byLevel).map(([level, pct]) => {
                const barMeta = levelMeta(Number(level));
                return (
                  <div key={level} className="text-left">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-fg">{barMeta.label}</span>
                      <span className="tabular-nums text-muted">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-fg/10">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: barMeta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3">
            <button type="button" onClick={nextLevel} className="btn btn-primary btn-block">
              <RefreshCw className="size-4" />
              Rejouer une manche
            </button>
            <Link href="/dashboard" className="btn btn-secondary btn-block">
              Retour aux parties
            </Link>
            <Link href={`/game/${sessionId}/review`} className="btn btn-ghost btn-block">
              <ListChecks className="size-4" />
              Revoir les questions
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* ——————————————————————
     Partie en cours
     —————————————————————— */
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-14">
      <TopBar code={state.code} copied={copied} onCopy={copyCode} />

      <section className="mt-6 animate-fade-up">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((lvl) => {
            const barMeta = levelMeta(lvl);
            const active = lvl === state.currentLevel;
            const passed = lvl < state.currentLevel;
            return (
              <div key={lvl} className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span
                  className="h-1.5 w-full rounded-full transition-colors duration-500"
                  style={{
                    backgroundColor: active || passed ? barMeta.color : "var(--color-line)",
                  }}
                />
                <span
                  className="truncate text-[0.7rem] font-semibold tracking-wide"
                  style={{ color: active ? barMeta.color : "var(--color-muted)" }}
                >
                  {barMeta.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-sm text-muted">
            <span className="text-base leading-none">{partner?.avatarEmoji ?? "·"}</span>
            <span className="truncate">avec {partnerName}</span>
          </p>
          <span className="badge shrink-0">
            Niveau {state.currentLevel} / 3
          </span>
        </div>

        <p className="mt-2 text-xs text-muted">{meta.hint}</p>
      </section>

      <section className="mt-5">
        {/* Révélation */}
        {round?.status === "revealed" && (
          <div
            className="card p-6 text-center animate-pop"
            style={{
              borderColor: round.matched ? "color-mix(in oklab, var(--color-sage) 45%, transparent)" : undefined,
              backgroundColor: round.matched
                ? "color-mix(in oklab, var(--color-sage) 10%, var(--color-surface))"
                : undefined,
            }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Question révélée</p>
            <p className="mt-2 text-sm leading-relaxed text-fg">{round.question.text}</p>

            <p
              data-testid="reveal-result"
              className={`mt-4 font-display text-2xl font-semibold ${round.matched ? "text-sage" : "text-accent"}`}
            >
              {round.matched ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="size-6" /> Vous êtes alignés
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <X className="size-6" /> Réponses différentes
                </span>
              )}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-left">
              {round.answers.map((entry) => {
                const mine = entry.userId === userId;
                return (
                  <div key={entry.userId} className="rounded-2xl border border-line bg-canvas/60 px-3.5 py-3">
                    <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                      {mine ? "Vous" : partnerName}
                    </p>
                    <p className="mt-1 text-sm font-medium text-fg">{entry.choice}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question en cours */}
        {round && round.status === "pending" && (
          <div className="card p-6 animate-pop">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Question · niveau {round.level}
            </p>
            <p className="mt-2.5 font-display text-xl leading-snug font-semibold text-fg">
              {round.question.text}
            </p>

            {remaining !== null && (
              <div
                data-testid="countdown"
                className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-canvas/60 px-4 py-2.5"
                role="timer"
                aria-live="polite"
              >
                <span className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                  <Timer className="size-3.5" />
                  {timeUp ? "Temps écoulé" : "Temps restant"}
                </span>
                <span
                  className={`font-display text-lg font-semibold tabular-nums ${timeUp ? "text-accent" : "text-fg"}`}
                >
                  {timeUp ? "0:00" : formatCountdown(remaining)}
                </span>
              </div>
            )}

            {round.myAnswer ? (
              <div className="mt-5 rounded-2xl border border-line bg-canvas/60 px-4 py-4 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-medium text-sage">
                  <Check className="size-4" />
                  Réponse enregistrée
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  {round.partnerAnswered
                    ? "Calcul du résultat…"
                    : `En attente de ${partnerName}…`}
                </p>
                {round.partnerAnswered && (
                  <span className="badge badge-accent mt-3 animate-pulse-ring">
                    <span className="dot" />
                    Révélation imminente
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-2.5">
                {round.question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid="answer-option"
                    onClick={() => answer(option)}
                    disabled={answering || timeUp}
                    className="btn btn-secondary justify-start text-left disabled:opacity-60"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-[0.7rem] font-semibold text-muted">
                      {String.fromCharCode(65 + round.question.options.indexOf(option))}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tirage / attente */}
        {!round || round.status === "revealed" ? (
          <div className="card mt-4 flex flex-col items-center px-6 py-8 text-center">
            {state.currentRound?.status === "revealed" && (
              <p className="mb-5 text-xs uppercase tracking-[0.16em] text-muted">
                Prochaine manche
              </p>
            )}
            {isMyTurn ? (
              <button
                type="button"
                data-testid="draw"
                onClick={draw}
                disabled={drawing}
                className="btn btn-block text-base disabled:opacity-60"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${meta.color}, color-mix(in oklab, ${meta.color} 70%, var(--color-plum)))`,
                  color: "#fff",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                {drawing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Tirage…
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Tirer une carte
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full gradient-brand-soft">
                  <Hourglass className="size-5 text-accent" strokeWidth={1.9} />
                </span>
                <p className="text-sm text-muted">
                  C&apos;est au tour de <span className="font-medium text-fg">{partnerName}</span>{" "}
                  de tirer une carte.
                </p>
                <span className="badge badge-accent animate-pulse-ring">
                  <span className="dot" />
                  En attente
                </span>
              </div>
            )}

            {state.compatibility.totalRounds > 0 && (
              <button
                type="button"
                onClick={nextLevel}
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted underline decoration-line underline-offset-4 transition hover:text-fg"
              >
                {state.currentLevel === 3 ? "Terminer la partie" : "Passer au niveau suivant"}
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        ) : null}
      </section>

      {/* Score en cours */}
      <section className="card mt-4 flex items-center justify-between px-5 py-4" data-testid="compatibility">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Compatibilité</p>
          <p className="mt-0.5 text-sm text-muted">
            {state.compatibility.matchedRounds} / {state.compatibility.totalRounds} alignées
          </p>
        </div>
        <ProgressRing value={state.compatibility.percentage} size={58} stroke={6} color={meta.color} />
      </section>

      {error && (
        <p className="mt-4 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-2.5 text-center text-sm text-accent animate-pop">
          {error}
        </p>
      )}
    </main>
  );
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function TopBar({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-5">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="size-4" />
        Parties
      </Link>

      <div className="flex items-center gap-1.5">
        <Logo compact href="/dashboard" />
        <button
          type="button"
          onClick={onCopy}
          data-testid="topbar-code"
          className="btn btn-ghost btn-sm"
          title="Copier le code"
          aria-label={`Copier le code ${code}`}
        >
          <span className="font-display tracking-[0.18em]">{code}</span>
          {copied ? <Check className="size-4 text-sage" /> : <ClipboardCopy className="size-4" />}
        </button>
      </div>
    </div>
  );
}
