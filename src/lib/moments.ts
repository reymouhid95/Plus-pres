import { db } from "./db";

export type Moment = {
  id: string;
  duoId: string;
  sessionId: string | null;
  title: string;
  content: string | null;
  imageUrl: string | null;
  questionId: string | null;
  createdAt: Date;
};

/** Crée un moment pour le duo (§25). */
export async function createMoment(data: {
  duoId: string;
  sessionId?: string | null;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  questionId?: string | null;
}): Promise<Moment> {
  return db.moment.create({
    data: {
      duoId: data.duoId,
      sessionId: data.sessionId ?? null,
      title: data.title,
      content: data.content ?? null,
      imageUrl: data.imageUrl ?? null,
      questionId: data.questionId ?? null,
    },
  });
}

/** Liste les moments d'un duo (§26, §28). */
export async function listMomentsForDuo(duoId: string): Promise<Moment[]> {
  return db.moment.findMany({
    where: { duoId },
    orderBy: { createdAt: "desc" },
    include: {
      session: { select: { id: true, createdAt: true } },
      question: { select: { id: true, text: true, type: true, options: true } },
    },
  });
}

/** Récupère un moment par son ID. */
export async function getMomentById(id: string): Promise<Moment | null> {
  return db.moment.findUnique({
    where: { id },
    include: {
      session: { select: { id: true, createdAt: true } },
      question: { select: { id: true, text: true, type: true, options: true } },
    },
  });
}