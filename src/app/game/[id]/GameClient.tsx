"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Check,
  ClipboardCopy,
  Heart,
  Hourglass,
  Link2,
  ListChecks,
  MessageCircleHeart,
  PartyPopper,
  Play,
  RefreshCw,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "@/components/ui/ToastSystem";
import { Skeleton } from "@/components/ui/Skeleton";
import Logo from "@/components/Logo";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import DiscoveryScreen from "@/components/DiscoveryScreen";
import SaveMomentDialog from "@/components/SaveMomentDialog";
import { remainingMs } from "@/lib/timer";
import { levelMeta } from "@/lib/levels";
import {
  DISCUSSION_TYPES,
  MOTIVATIONS,
  OPENER_LABELS,
  REACTION_EMOJIS,
} from "@/lib/interactions";

type RoundState = {
  id: string;
  level: number;
  status: "pending" | "revealed";
  matched: boolean | null;
  startedAt: string | null;
  expiresAt: string | null;
  question: { id: string; text: string; type: "single" | "multiple" | "scale" | "ranking" | "open" | "prediction"; options: string[]; scaleMin?: number; scaleMax?: number };
  myAnswer: string | string[] | number | null;
  partnerAnswered: boolean;
  answers: { userId: string; choice: string }[];
  reactions: { userId: string; emoji: string }[];
  discussions: { userId: string; type: string; content: string | null }[];
  myPrediction: string | null;
  partnerPredicted: boolean;
  predictions: { userId: string; choice: string }[];
  predictionCorrect: boolean | null;
};

type SessionState = {
  id: string;
  code: string;
  duoId: string;
  status: "waiting" | "lobby" | "active" | "completed";
  currentLevel: number;
  maxRounds: number;
  roundsPlayed: number;
  predictionsEnabled: boolean;
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
  results: {
    matched: number;
    mismatched: number;
    conversations: number;
    reactions: number;
    knowledge: { correct: number; total: number };
  };
  /** Horodatage serveur : sert à corriger l'horloge locale du navigateur. */
  serverNow: number;
};

export default function GameClient({ sessionId, userId }: { sessionId: string; userId: string }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [rematching, setRematching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMotivations, setShowMotivations] = useState(false);
  const [closedRoundId, setClosedRoundId] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryContent, setDiscoveryContent] = useState<string>("");
  const [saveMomentOpen, setSaveMomentOpen] = useState(false);
  const [saveMomentData, setSaveMomentData] = useState<{
    title: string;
    content: string;
    questionId?: string;
  } | null>(null);
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

  // « X vient de rejoindre votre expérience » (§10) : l'autre joueur apparaît
  // dans l'état poussé par le SSE. Pas de toast au premier chargement.
  const observedPartnerId = state
    ? ((state.host.id === userId ? state.partner?.id : state.host.id) ?? null)
    : null;
  const observedPartnerName = state
    ? ((state.host.id === userId ? state.partner?.displayName : state.host.displayName) ?? null)
    : null;
  const prevPartnerId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (prevPartnerId.current === undefined) {
      prevPartnerId.current = observedPartnerId;
      return;
    }
    if (observedPartnerId && observedPartnerId !== prevPartnerId.current) {
      toast(
        `${observedPartnerName ?? "Votre partenaire"} vient de rejoindre votre expérience 🎉`,
        "success",
      );
    }
    prevPartnerId.current = observedPartnerId;
  }, [observedPartnerId, observedPartnerName]);

  // Nouvel écran de motivations à chaque manche.
  const currentRoundId = state?.currentRound?.id ?? null;
  useEffect(() => {
    setShowMotivations(false);
  }, [currentRoundId]);

  // Déclencher la découverte du jour quand la partie se termine
  useEffect(() => {
    if (state?.status === "completed" && !showDiscovery) {
      handleSessionComplete();
    }
  }, [state?.status, showDiscovery]);

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
  const myReaction = round?.reactions.find((entry) => entry.userId === userId)?.emoji ?? null;
  const partnerReaction =
    round?.reactions.find((entry) => entry.userId !== userId)?.emoji ?? null;
  const myChoice = round?.answers.find((entry) => entry.userId === userId)?.choice ?? null;
  const theirChoice = round?.answers.find((entry) => entry.userId !== userId)?.choice ?? null;
  const partnerPrediction =
    round?.predictions.find((entry) => entry.userId !== userId) ?? null;
  const partnerCorrect =
    partnerPrediction && myChoice ? partnerPrediction.choice === myChoice : null;
  const myDiscussion = round?.discussions.find((entry) => entry.userId === userId) ?? null;
  const partnerDiscussion =
    round?.discussions.find((entry) => entry.userId !== userId) ?? null;
  const openersOpen = Boolean(
    round && round.status === "revealed" && !round.matched && round.id !== closedRoundId && !myDiscussion,
  );
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

  async function predict(choice: string | string[] | number) {
    if (!round) return;
    setPredicting(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: round.id, choice }),
    });
    const data = await res.json();
    setPredicting(false);
    if (!res.ok) {
      setError(data.error);
      toast(data.error ?? "Prédiction impossible.", "error");
      return;
    }
    fetchState();
  }

  async function answer(choice: string | string[] | number) {
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

  async function react(emoji: string) {
    if (!round) return;
    const res = await fetch(`/api/sessions/${sessionId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: round.id, emoji }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Réaction impossible.", "error");
      return;
    }
    fetchState();
  }

  async function discuss(type: string, content?: string) {
    if (!round) return;
    const res = await fetch(`/api/sessions/${sessionId}/discuss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: round.id, type, content }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Action impossible.", "error");
      return;
    }
    setShowMotivations(false);
    fetchState();
  }

  async function rematch() {
    if (!state) return;
    setRematching(true);
    setError(null);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duoId: state.duoId }),
    });
    const data = await res.json();
    setRematching(false);
    if (!res.ok) {
      setError(data.error);
      toast(data.error ?? "Nouvelle partie impossible.", "error");
      return;
    }
    router.push(`/game/${data.id}`);
  }

  async function handleSessionComplete() {
    if (!state) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/discovery`, { method: "POST" });
      if (res.ok) {
        const discovery = await res.json();
        setDiscoveryContent(discovery.content);
        setShowDiscovery(true);
      }
    } catch {
      // Si la découverte échoue, on continue sans
    }
  }

  async function handleSaveMoment(data: { title: string; content: string; questionId?: string }) {
    if (!state) return;
    await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duoId: state.duoId,
        sessionId,
        title: data.title,
        content: data.content,
        questionId: data.questionId,
      }),
    });
  }

  async function openSaveMoment(data: { title: string; content: string; questionId?: string }) {
    setSaveMomentData(data);
    setSaveMomentOpen(true);
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

  const inviteLink = `${window.location.origin}/join/${state.code}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast("Lien copié dans le presse-papiers.", "success");
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      toast("Copie impossible — notez le lien.", "error");
    }
  }

  async function start() {
    setStarting(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/start`, { method: "POST" });
    const data = await res.json();
    setStarting(false);
    if (!res.ok) {
      setError(data.error);
      toast(data.error ?? "Démarrage impossible.", "error");
      return;
    }
    fetchState();
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

          <div className="mt-8 w-full max-w-xs">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Ou partage ce lien
            </p>
            <a
              href={inviteLink}
              data-testid="invite-link"
              className="mt-2 block truncate text-sm text-accent underline decoration-line underline-offset-4"
            >
              {inviteLink}
            </a>
            <button
              type="button"
              onClick={copyLink}
              data-testid="copy-link"
              className="btn btn-secondary btn-sm mt-3"
            >
              {copiedLink ? <Check className="size-4 text-sage" /> : <Link2 className="size-4" />}
              Copier le lien
            </button>
            <p className="mt-2 text-xs text-muted">Un simple pseudo suffit pour jouer.</p>
          </div>

          <p className="mt-10 text-xs text-muted">
            Cette page se met à jour toute seule&nbsp;: reste sur cet écran.
          </p>
        </section>
      </main>
    );
  }

  /* ——————————————————————
     Lobby (§11)
     —————————————————————— */
  if (state.status === "lobby") {
    const players = [state.host, state.partner].filter(
      (player): player is NonNullable<typeof player> => player !== null,
    );
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-14">
        <TopBar code={state.code} copied={copied} onCopy={copyCode} />

        <section
          data-testid="lobby"
          className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up"
        >
          <span className="grid size-16 place-items-center rounded-full gradient-brand-soft">
            <Users className="size-7 text-accent" strokeWidth={1.8} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold text-fg">
            Le duo est au complet
          </h1>
          <p className="mt-2 text-sm text-muted">avec {partnerName}</p>

          <div className="mt-7 grid w-full grid-cols-2 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                data-testid="lobby-player"
                className="card flex flex-col items-center gap-1.5 px-4 py-5"
              >
                <span className="text-3xl leading-none">{player.avatarEmoji}</span>
                <p className="truncate text-sm font-medium text-fg">{player.displayName}</p>
                <span className="badge badge-accent">
                  {player.id === userId ? "Toi" : "Partenaire"}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-sage">
            <Check className="size-4" />
            Les deux joueurs sont prêts.
          </p>

          <button
            type="button"
            onClick={start}
            disabled={starting}
            data-testid="start-session"
            className="btn btn-primary btn-block mt-5 disabled:opacity-60"
          >
            {starting ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Démarrage…
              </>
            ) : (
              <>
                <Play className="size-4" />
                Commencer l&apos;expérience
              </>
            )}
          </button>
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

          <div className="card mt-7 w-full p-6 text-left" data-testid="results">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Vous avez découvert</p>
            <dl className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between gap-3" data-testid="result-common">
                <dt className="flex items-center gap-2 text-sm text-fg">
                  <Heart className="size-4 text-accent" />
                  Points communs
                </dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-fg">
                  {state.results.matched}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3" data-testid="result-different">
                <dt className="flex items-center gap-2 text-sm text-fg">
                  <Sparkles className="size-4 text-gold" />
                  Différences
                </dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-fg">
                  {state.results.mismatched}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3" data-testid="result-knowledge">
                <dt className="flex items-center gap-2 text-sm text-fg">
                  <Brain className="size-4 text-accent" />
                  Bien deviné
                </dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-fg">
                  {state.results.knowledge.correct}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3" data-testid="result-surprises">
                <dt className="flex items-center gap-2 text-sm text-fg">
                  <Zap className="size-4 text-gold" />
                  Surprises
                </dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-fg">
                  {state.results.knowledge.total - state.results.knowledge.correct}
                </dd>
              </div>
              <div
                className="flex items-center justify-between gap-3"
                data-testid="result-conversations"
              >
                <dt className="flex items-center gap-2 text-sm text-fg">
                  <MessageCircleHeart className="size-4 text-sage" />
                  Conversations ouvertes
                </dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-fg">
                  {state.results.conversations}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3" data-testid="result-reactions">
                <dt className="flex items-center gap-2 text-sm text-fg">
                  <Users className="size-4 text-muted" />
                  Réactions échangées
                </dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-fg">
                  {state.results.reactions}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-3 border-t border-line pt-5">
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

          </section>
      </main>
    );
  }

  // Écran de découverte du jour (modal)
  if (showDiscovery) {
    return (
      <DiscoveryScreen
        sessionId={sessionId}
        duoId={state.duoId}
        content={discoveryContent}
        onSaveMoment={openSaveMoment}
        onClose={() => setShowDiscovery(false)}
      />
    );
  }

  // Modal de sauvegarde de moment
  if (saveMomentOpen && saveMomentData) {
    return (
      <SaveMomentDialog
        isOpen={saveMomentOpen}
        onClose={() => setSaveMomentOpen(false)}
        onSave={handleSaveMoment}
        defaultTitle={saveMomentData.title}
        defaultContent={saveMomentData.content}
        questionId={saveMomentData.questionId}
      />
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
              className={`mt-4 font-display text-2xl font-semibold ${round.matched ? "text-sage" : "text-fg"}`}
            >
              {round.matched ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="size-6" /> Vous êtes alignés
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="size-6 text-gold" /> Vous avez choisi différemment.
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

            {/* Connaissance mutuelle (§18) */}
            {state.predictionsEnabled && (
              <div
                data-testid="prediction-result"
                className="mt-5 rounded-2xl border border-line bg-canvas/60 px-4 py-4 text-left"
              >
                {round.predictionCorrect === true ? (
                  <p className="text-sm font-medium text-fg">
                    🎯 Bien deviné&nbsp;!{" "}
                    <span className="font-normal text-muted">
                      Tu connaissais la réponse de {partnerName}.
                    </span>
                  </p>
                ) : round.predictionCorrect === false ? (
                  <p className="text-sm font-medium text-fg">
                    😄 Raté&nbsp;!{" "}
                    <span className="font-normal text-muted">
                      Tu pensais «&nbsp;{round.myPrediction}&nbsp;», {partnerName} a choisi
                      «&nbsp;{theirChoice}&nbsp;».
                    </span>
                  </p>
                ) : null}
                {partnerPrediction && (
                  <p className="mt-1.5 text-sm text-muted">
                    {partnerName} pensait «&nbsp;{partnerPrediction.choice}&nbsp;» —{" "}
                    {partnerCorrect ? "bien deviné." : "raté."}
                  </p>
                )}
              </div>
            )}

            {/* Réactions rapides (§19) */}
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Réagir</p>
              <div className="mt-2.5 flex items-center justify-center gap-1.5">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    data-testid={`reaction-${emoji}`}
                    onClick={() => react(emoji)}
                    aria-label={`Réagir ${emoji}`}
                    className={`grid size-11 place-items-center rounded-2xl border text-xl transition hover:scale-105 ${
                      myReaction === emoji
                        ? "border-accent/60 bg-accent/10"
                        : "border-line bg-canvas/60"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {partnerReaction && (
                <p data-testid="partner-reaction" className="mt-2.5 text-sm text-muted">
                  {partnerName} a réagi {partnerReaction}
                </p>
              )}
            </div>

            {/* Conversation après une divergence (§20, §21) */}
            {!round.matched && (
              <div className="mt-5 rounded-2xl border border-line bg-canvas/60 px-4 py-4">
                {myDiscussion || partnerDiscussion ? (
                  <div data-testid="discussion" className="flex flex-col gap-1.5 text-sm">
                    {myDiscussion && (
                      <p>
                        <span className="font-medium text-fg">Vous : </span>
                        <span className="text-muted">
                          {OPENER_LABELS[myDiscussion.type] ?? myDiscussion.type}
                          {myDiscussion.content ? ` · ${myDiscussion.content}` : ""}
                        </span>
                      </p>
                    )}
                    {partnerDiscussion && (
                      <p>
                        <span className="font-medium text-fg">{partnerName} : </span>
                        <span className="text-muted">
                          {OPENER_LABELS[partnerDiscussion.type] ?? partnerDiscussion.type}
                          {partnerDiscussion.content ? ` · ${partnerDiscussion.content}` : ""}
                        </span>
                      </p>
                    )}
                  </div>
                ) : openersOpen && !showMotivations ? (
                  <>
                    <p className="text-sm font-medium text-fg">
                      Vous avez choisi différemment. Pourquoi&nbsp;?
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        data-testid="opener-pourquoi"
                        onClick={() => setShowMotivations(true)}
                        className="btn btn-secondary btn-sm justify-start"
                      >
                        Pourquoi ce choix&nbsp;?
                      </button>
                      <button
                        type="button"
                        data-testid="opener-defendre"
                        onClick={() => discuss(DISCUSSION_TYPES.DEFENDRE)}
                        className="btn btn-secondary btn-sm justify-start"
                      >
                        Défendre mon choix
                      </button>
                      <button
                        type="button"
                        data-testid="opener-compromis"
                        onClick={() => discuss(DISCUSSION_TYPES.COMPROMIS)}
                        className="btn btn-secondary btn-sm justify-start"
                      >
                        Trouver un compromis
                      </button>
                      <button
                        type="button"
                        data-testid="opener-continuer"
                        onClick={() => setClosedRoundId(round.id)}
                        className="btn btn-ghost btn-sm"
                      >
                        Continuer
                      </button>
                    </div>
                  </>
                ) : openersOpen ? (
                  <>
                    <p className="text-sm font-medium text-fg">
                      Qu&apos;est-ce qui a guidé ton choix&nbsp;?
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {MOTIVATIONS.map((motivation) => (
                        <button
                          key={motivation}
                          type="button"
                          data-testid={`motivation-${motivation}`}
                          onClick={() => discuss(DISCUSSION_TYPES.MOTIVATION, motivation)}
                          className="btn btn-secondary btn-sm"
                        >
                          {motivation}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMotivations(false)}
                      className="mt-2 text-xs text-muted underline decoration-line underline-offset-4 transition hover:text-fg"
                    >
                      Retour
                    </button>
                  </>
                ) : null}
              </div>
            )}
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

            {state.predictionsEnabled && !round.myPrediction ? (
              <QuestionRenderer
                question={{
                  id: round.question.id,
                  text: round.question.text,
                  type: round.question.type,
                  options: round.question.options,
                  scaleMin: round.question.scaleMin,
                  scaleMax: round.question.scaleMax,
                }}
                myAnswer={round.myPrediction}
                disabled={predicting || timeUp}
                onAnswer={predict}
                testIdPrefix="predict"
              />
            ) : round.myAnswer ? (
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
              <>
                {state.predictionsEnabled && round.myPrediction && (
                  <p className="mt-4 text-sm text-muted">
                    Tu as prédit «&nbsp;{round.myPrediction}&nbsp;» — à toi de répondre.
                  </p>
                )}
                <QuestionRenderer
                  question={{
                    id: round.question.id,
                    text: round.question.text,
                    type: round.question.type,
                    options: round.question.options,
                    scaleMin: round.question.scaleMin,
                    scaleMax: round.question.scaleMax,
                  }}
                  myAnswer={round.myAnswer}
                  disabled={answering || timeUp}
                  onAnswer={answer}
                />
              </>
            )}
          </div>
        )}

        {/* Tirage / attente */}
        {!round || round.status === "revealed" ? (
          <div className="card mt-4 flex flex-col items-center px-6 py-8 text-center">
            <p data-testid="progress" className="mb-5 text-xs uppercase tracking-[0.16em] text-muted">
              Carte {Math.min(state.roundsPlayed + 1, state.maxRounds)} / {state.maxRounds}
            </p>
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

          </div>
        ) : null}
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
