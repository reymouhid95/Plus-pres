import { z } from "zod";

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

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type JoinInput = z.infer<typeof joinSchema>;

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}
