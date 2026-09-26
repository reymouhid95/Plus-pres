import { db } from "./db";

export type ChallengeStatus = "pending" | "completed";

export type Challenge = {
  id: string;
  duoId: string;
  title: string;
  description: string | null;
  status: ChallengeStatus;
  createdAt: Date;
  completedAt: Date | null;
};

/** Crée un challenge pour le duo (§27). */
export async function createChallenge(data: {
  duoId: string;
  title: string;
  description?: string | null;
}): Promise<Challenge> {
  return db.challenge.create({
    data: {
      duoId: data.duoId,
      title: data.title,
      description: data.description ?? null,
      status: "pending",
    },
  }) as Promise<Challenge>;
}

/** Liste les challenges d'un duo (§27). */
export async function listChallengesForDuo(duoId: string): Promise<Challenge[]> {
  return db.challenge.findMany({
    where: { duoId },
    orderBy: { createdAt: "desc" },
  }) as Promise<Challenge[]>;
}

/** Marque un challenge comme terminé. */
export async function completeChallenge(challengeId: string, userId: string): Promise<Challenge | null> {
  const challenge = await db.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return null;

  const membership = await db.duoMember.findUnique({
    where: { duoId_userId: { duoId: challenge.duoId, userId } },
  });
  if (!membership) return null;

  return db.challenge.update({
    where: { id: challengeId },
    data: { status: "completed", completedAt: new Date() },
  }) as Promise<Challenge>;
}

/** Supprime un challenge. */
export async function deleteChallenge(challengeId: string, userId: string): Promise<boolean> {
  const challenge = await db.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return false;

  const membership = await db.duoMember.findUnique({
    where: { duoId_userId: { duoId: challenge.duoId, userId } },
  });
  if (!membership) return false;

  await db.challenge.delete({ where: { id: challengeId } });
  return true;
}