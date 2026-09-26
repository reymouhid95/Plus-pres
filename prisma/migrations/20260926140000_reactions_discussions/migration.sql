-- Phase C : réactions (§19), conversations (§20), sessions courtes (§13)
-- Migration strictement additive : aucun retrait, applicable sans interruption.

-- Sessions courtes : 5 à 7 cartes par défaut.
ALTER TABLE "GameSession" ADD COLUMN "maxRounds" INTEGER NOT NULL DEFAULT 6;

-- CreateTable Reaction
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Reaction_roundId_userId_key" ON "Reaction"("roundId", "userId");
CREATE INDEX "Reaction_roundId_idx" ON "Reaction"("roundId");

-- CreateTable Discussion
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Discussion_roundId_userId_key" ON "Discussion"("roundId", "userId");
CREATE INDEX "Discussion_roundId_idx" ON "Discussion"("roundId");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
