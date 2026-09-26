-- Phase E : contenu éditable — Question.active, User.role (§40 SHOULD)
-- Migration strictement additive : aucun retrait, applicable sans interruption.

ALTER TABLE "Question" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';