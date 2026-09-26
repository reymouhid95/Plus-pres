-- Phase E suite : types de questions avancés (§14)
-- Migration additive : type + scaleMin + scaleMax

ALTER TABLE "Question" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'single';
ALTER TABLE "Question" ADD COLUMN "scaleMin" INTEGER;
ALTER TABLE "Question" ADD COLUMN "scaleMax" INTEGER;