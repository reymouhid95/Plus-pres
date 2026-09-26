import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionSchema } from "@/lib/validation";

async function checkAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "admin";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!(await checkAdmin((session.user as any).id))) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const replace = formData.get("replace") === "true";

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
  }

  const text = await file.text();
  let parsed: unknown;

  try {
    if (file.name.endsWith(".json")) {
      parsed = JSON.parse(text);
    } else if (file.name.endsWith(".csv")) {
      parsed = csvToJson(text);
    } else {
      return NextResponse.json({ error: "Format non supporté (JSON ou CSV)." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
  }

  if (!Array.isArray(parsed)) {
    return NextResponse.json({ error: "Le fichier doit contenir un tableau de questions." }, { status: 400 });
  }

  const results = { created: 0, updated: 0, errors: [] as string[] };

  for (const [index, item] of parsed.entries()) {
    const validated = questionSchema.safeParse(item);
    if (!validated.success) {
      results.errors.push(`Ligne ${index + 1}: ${validated.error.issues.map((i) => i.message).join(", ")}`);
      continue;
    }

    try {
      if (replace) {
        await db.question.upsert({
          where: { id: (item as any).id ?? "" },
          create: validated.data,
          update: validated.data,
        });
        results.updated++;
      } else {
        await db.question.create({ data: validated.data });
        results.created++;
      }
    } catch (e) {
      results.errors.push(`Ligne ${index + 1}: ${e instanceof Error ? e.message : "Erreur inconnue"}`);
    }
  }

  return NextResponse.json(results);
}

function csvToJson(csv: string): unknown[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      const val = values[i];
      if (header === "options") {
        try {
          obj[header] = JSON.parse(val);
        } catch {
          obj[header] = val.split(";").map((s) => s.trim());
        }
      } else if (header === "level" || header === "active") {
        obj[header] = val === "true" ? true : val === "false" ? false : Number(val);
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
}