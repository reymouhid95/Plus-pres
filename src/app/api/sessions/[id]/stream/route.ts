import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildGameState } from "@/lib/game-state";

// Vercel coupe les fonctions serverless à `maxDuration` : on referme le flux
// juste avant et EventSource se reconnecte de lui-même.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const TICK_MS = 500;
const PING_MS = 15_000;
const LIFETIME_MS = 55_000;

const HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  // Désactive le buffering des proxies (nginx, Vercel edge).
  "X-Accel-Buffering": "no",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response(null, { status: 401 });
  const userId = (session.user as any).id as string;

  const membership = await db.gameSession.findUnique({
    where: { id },
    select: { hostId: true, partnerId: true },
  });
  if (!membership || (membership.hostId !== userId && membership.partnerId !== userId)) {
    return new Response(null, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastPayload = "";
      let lastPing = Date.now();
      const startedAt = Date.now();

      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Client parti : la boucle s'en rendra compte via req.signal.
        }
      };

      const tick = async () => {
        try {
          const state = await buildGameState(id, userId);
          if (state) {
            const payload = JSON.stringify(state);
            if (payload !== lastPayload) {
              lastPayload = payload;
              write(`data: ${payload}\n\n`);
            }
          }
        } catch (error) {
          console.error("[stream] échec de l'état de la partie", error);
        }

        const now = Date.now();
        if (now - lastPing >= PING_MS) {
          lastPing = now;
          write(`event: ping\ndata: {}\n\n`);
        }
      };

      await tick();

      while (Date.now() - startedAt < LIFETIME_MS && !req.signal.aborted) {
        await sleep(TICK_MS);
        if (req.signal.aborted) break;
        await tick();
      }

      write(`event: bye\ndata: {}\n\n`);
      try {
        controller.close();
      } catch {
        // Déjà fermé côté client.
      }
    },
    cancel() {
      // Annulation par le navigateur : rien à libérer, la boucle sortira
      // au prochain contrôle de req.signal.
    },
  });

  return new Response(stream, { headers: HEADERS });
}
