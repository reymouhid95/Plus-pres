import { customAlphabet } from "nanoid";
import { db } from "./db";
import { SESSION_STATUS } from "./session-state";

/**
 * Modèle Duo — cahier §32.
 *
 * Le duo est l'entité durable : il porte le code d'invitation (§9) et peut
 * enchaîner plusieurs sessions (→ « Notre histoire » §26). La session n'est
 * qu'une partie jouée au sein d'un duo.
 */
export const DUO_STATUS = { PENDING: "pending", READY: "ready" } as const;
export type DuoStatus = (typeof DUO_STATUS)[keyof typeof DUO_STATUS];

export const DUO_ROLES = { HOST: "host", PARTNER: "partner" } as const;

export const MAX_MEMBERS = 2;

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export type MembershipCheck = { ok: true } | { ok: false; error: string };

/** Garde pure : ce joueur peut-il rejoindre ce duo ? (§10) */
export function canAddMember(memberUserIds: string[], userId: string): MembershipCheck {
  if (memberUserIds.includes(userId)) {
    return { ok: false, error: "Vous êtes déjà membre de ce duo." };
  }
  if (memberUserIds.length >= MAX_MEMBERS) {
    return { ok: false, error: "Ce duo est déjà complet." };
  }
  return { ok: true };
}

/** Garde pure : l'autre membre du duo (bascule de tour). */
export function otherMemberId(memberUserIds: string[], userId: string): string | null {
  return memberUserIds.find((id) => id !== userId) ?? null;
}

export async function isDuoMember(duoId: string, userId: string): Promise<boolean> {
  const count = await db.duoMember.count({ where: { duoId, userId } });
  return count > 0;
}

export type DuoMemberInfo = {
  userId: string;
  role: string;
  displayName: string;
  avatarEmoji: string;
};

export async function getDuoMembers(duoId: string): Promise<DuoMemberInfo[]> {
  const members = await db.duoMember.findMany({
    where: { duoId },
    include: { user: { select: { displayName: true, avatarEmoji: true } } },
    orderBy: { joinedAt: "asc" },
  });
  return members.map((member) => ({
    userId: member.userId,
    role: member.role,
    displayName: member.user.displayName,
    avatarEmoji: member.user.avatarEmoji,
  }));
}

export async function duoMemberIds(duoId: string): Promise<string[]> {
  const members = await db.duoMember.findMany({ where: { duoId }, select: { userId: true } });
  return members.map((member) => member.userId);
}

export async function otherMember(duoId: string, userId: string): Promise<string | null> {
  const ids = await duoMemberIds(duoId);
  return otherMemberId(ids, userId);
}

export type DuoForCode = { id: string; status: string; memberUserIds: string[] } | null;

/** Retrouve un duo par son code d'invitation (§9). */
export async function duoForCode(code: string): Promise<DuoForCode> {
  const duo = await db.duo.findUnique({
    where: { code },
    include: { members: { select: { userId: true } } },
  });
  if (!duo) return null;
  return { id: duo.id, status: duo.status, memberUserIds: duo.members.map((m) => m.userId) };
}

/** Génère un code de duo unique (alphabet sans ambiguïté). */
export async function generateDuoCode(): Promise<string> {
  let code = genCode();
  while (await db.duo.findUnique({ where: { code } })) {
    code = genCode();
  }
  return code;
}

/**
 * Crée un duo (hôte seul, statut pending) et sa première session (lobby, §11).
 * Phase B : une « nouvelle partie » = un nouveau duo, comme avant.
 */
export async function createDuoWithSession(hostUserId: string) {
  const code = await generateDuoCode();
  return db.$transaction(async (tx) => {
    const duo = await tx.duo.create({ data: { code, status: DUO_STATUS.PENDING } });
    await tx.duoMember.create({
      data: { duoId: duo.id, userId: hostUserId, role: DUO_ROLES.HOST },
    });
    const session = await tx.gameSession.create({
      data: { duoId: duo.id, status: SESSION_STATUS.LOBBY, turnUserId: hostUserId },
    });
    return { duo, session };
  });
}

/**
 * Ajoute un joueur au duo (statut ready) et renvoie la session à ouvrir.
 * Les sessions héritées (statut pré-lobby) basculent en lobby.
 */
export async function joinDuo(duoId: string, userId: string) {
  return db.$transaction(async (tx) => {
    await tx.duoMember.create({
      data: { duoId, userId, role: DUO_ROLES.PARTNER },
    });
    await tx.duo.update({ where: { id: duoId }, data: { status: DUO_STATUS.READY } });
    await tx.gameSession.updateMany({
      where: {
        duoId,
        status: { notIn: [SESSION_STATUS.PLAYING, SESSION_STATUS.COMPLETED] },
      },
      data: { status: SESSION_STATUS.LOBBY },
    });
    const session = await tx.gameSession.findFirst({
      where: { duoId, status: { not: SESSION_STATUS.COMPLETED } },
      orderBy: { createdAt: "desc" },
    });
    return session;
  });
}
