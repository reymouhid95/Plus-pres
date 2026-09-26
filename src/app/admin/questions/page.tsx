import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminQuestionsClient from "./AdminQuestionsClient";

export default async function AdminQuestionsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const user = userId ? await db.user.findUnique({ where: { id: userId }, select: { role: true } }) : null;

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const questions = await db.question.findMany({
    orderBy: [{ level: "asc" }, { category: "asc" }, { id: "asc" }],
  }) as Array<{ id: string; level: number; text: string; options: string[]; category: string | null; active: boolean; createdAt: Date }>;

  return <AdminQuestionsClient initialQuestions={questions} />;
}