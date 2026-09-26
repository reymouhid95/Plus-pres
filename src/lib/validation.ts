import { z } from "zod";
import { DISCUSSION_TYPES, MOTIVATIONS, REACTION_EMOJIS } from "./interactions";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(40),
});

export const profileSchema = z.object({
  displayName: z.string().min(1).max(40).optional(),
  avatarEmoji: z.string().min(1).max(8).optional(),
  bio: z.string().max(280).optional(),
  birthdate: z.string().optional(),
});

export const answerSchema = z.object({
  roundId: z.string().min(1),
  choice: z.string().min(1),
});

export const joinSchema = z.object({
  code: z.string().min(4).max(10),
});

/** Pseudo d'un joueur invité (lien d'invitation, §29). */
export const guestSchema = z.object({
  displayName: z.string().trim().min(2).max(30),
  code: z.string().min(4).max(10).optional(),
});

/** Conversion d'un invité en compte complet (même user.id, §29). */
export const upgradeSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(40).optional(),
});

/** Réaction rapide après une révélation (§19). */
export const reactSchema = z.object({
  roundId: z.string().min(1),
  emoji: z.enum(REACTION_EMOJIS),
});

/** Prédiction de la réponse de l'autre, avant de répondre (§18). */
export const predictSchema = z.object({
  roundId: z.string().min(1),
  choice: z.string().min(1),
});

/** Action de conversation après une divergence (§20, §21). */
export const discussSchema = z
  .object({
    roundId: z.string().min(1),
    type: z.enum([
      DISCUSSION_TYPES.POURQUOI,
      DISCUSSION_TYPES.DEFENDRE,
      DISCUSSION_TYPES.COMPROMIS,
      DISCUSSION_TYPES.MOTIVATION,
    ]),
    content: z.string().max(40).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === DISCUSSION_TYPES.MOTIVATION && !(MOTIVATIONS as readonly string[]).includes(value.content ?? "")) {
      ctx.addIssue({
        code: "custom",
        message: "Motivation invalide.",
        path: ["content"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type JoinInput = z.infer<typeof joinSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type UpgradeInput = z.infer<typeof upgradeSchema>;
export type ReactInput = z.infer<typeof reactSchema>;
export type PredictInput = z.infer<typeof predictSchema>;
export type DiscussInput = z.infer<typeof discussSchema>;

/** Question CRUD (admin). */
export const questionSchema = z.object({
  level: z.number().int().min(1).max(3),
  text: z.string().min(1).max(300),
  options: z.array(z.string().min(1)).min(2).max(6),
  category: z.string().min(1).max(50).optional(),
  active: z.boolean().optional(),
});

export type QuestionInput = z.infer<typeof questionSchema>;

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}
