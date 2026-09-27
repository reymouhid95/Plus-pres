import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Nettoie les entrées expirées du store (appelé périodiquement)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limiter à fenêtre glissante simple
 * Retourne { allowed: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60_000, maxRequests: 30 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${config.keyPrefix || "rl"}:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Nouvelle fenêtre
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Middleware de rate limiting pour les API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return function rateLimitMiddleware(
    request: NextRequest,
    getIdentifier: (req: NextRequest) => string
  ) {
    const identifier = getIdentifier(request);
    const result = rateLimit(identifier, config);

    // Nettoyage périodique (1% des requêtes)
    if (Math.random() < 0.01) {
      cleanupExpiredEntries();
    }

    const headers = new Headers();
    headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    headers.set("X-RateLimit-Remaining", result.remaining.toString());
    headers.set("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000).toString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      headers.set("Retry-After", retryAfter.toString());

      return new NextResponse(
        JSON.stringify({
          error: "Trop de requêtes. Réessayez plus tard.",
          retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    // Ajouter les headers à la réponse (le handler devra les merger)
    return { headers, result };
  };
}

/**
 * Identificateurs communs
 */
export const identifiers = {
  ip: (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown",
  userId: (req: NextRequest) => {
    // À utiliser dans les handlers où la session est déjà vérifiée
    return (req as any).userId || "anonymous";
  },
  sessionId: (req: NextRequest) => {
    const url = new URL(req.url);
    return url.pathname.split("/").pop() || "unknown";
  },
};

/**
 * Configurations prédéfinies
 * Les maximums sont surchargeables par env (tests e2e) — défauts inchangés en production.
 */
function envInt(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const rateLimitConfigs = {
  strict: { windowMs: 60_000, maxRequests: envInt("RATE_LIMIT_STRICT_MAX", 10), keyPrefix: "strict" },
  moderate: { windowMs: 60_000, maxRequests: envInt("RATE_LIMIT_MODERATE_MAX", 30), keyPrefix: "mod" },
  loose: { windowMs: 60_000, maxRequests: envInt("RATE_LIMIT_LOOSE_MAX", 100), keyPrefix: "loose" },
  auth: {
    windowMs: 15 * 60_000,
    maxRequests: envInt("RATE_LIMIT_AUTH_MAX", 5),
    keyPrefix: "auth",
  },
  gameAction: {
    windowMs: 60_000,
    maxRequests: envInt("RATE_LIMIT_GAME_MAX", 60),
    keyPrefix: "game",
  },
};