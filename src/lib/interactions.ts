import { MAX_LEVEL } from "./session-state";

/**
 * Boucle cœur — cahier §19, §20, §21.
 *
 * Réactions rapides après une révélation, actions de conversation après une
 * divergence, et motivations génériques (§21) quand on creuse un « pourquoi ».
 */
export const REACTION_EMOJIS = ["❤️", "😂", "😮", "👀", "🔥", "🤔"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const DISCUSSION_TYPES = {
  POURQUOI: "pourquoi",
  DEFENDRE: "defendre",
  COMPROMIS: "compromis",
  MOTIVATION: "motivation",
} as const;
export type DiscussionType =
  (typeof DISCUSSION_TYPES)[keyof typeof DISCUSSION_TYPES];

export const OPENER_LABELS: Record<string, string> = {
  [DISCUSSION_TYPES.POURQUOI]: "Pourquoi ce choix ?",
  [DISCUSSION_TYPES.DEFENDRE]: "Défendre mon choix",
  [DISCUSSION_TYPES.COMPROMIS]: "Trouver un compromis",
  [DISCUSSION_TYPES.MOTIVATION]: "Ma motivation",
};

/** Motivations génériques proposées après un « pourquoi » (exemple du §21). */
export const MOTIVATIONS = [
  "Travail",
  "Culture",
  "Famille",
  "Climat",
  "Aventure",
  "Qualité de vie",
  "Autre",
] as const;

/** Longueur d'une session : 5 à 7 cartes (§13). */
export const SESSION_LENGTH = 6;
/** Cartes par palier : le niveau avance tout seul au fil de la session. */
export const ROUNDS_PER_LEVEL = 2;

/** Niveau déduit de l'avancement : 2 cartes par palier. */
export function levelForRound(playedCount: number): number {
  return Math.min(MAX_LEVEL, Math.floor(playedCount / ROUNDS_PER_LEVEL) + 1);
}
