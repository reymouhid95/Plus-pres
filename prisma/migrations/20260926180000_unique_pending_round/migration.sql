-- Fix race condition: at most one pending round per session.
-- Unique partial index prevents two concurrent draw requests from creating
-- multiple pending rounds for the same session.

CREATE UNIQUE INDEX IF NOT EXISTS "one_pending_round_per_session"
ON "Round" ("sessionId")
WHERE status = 'pending';