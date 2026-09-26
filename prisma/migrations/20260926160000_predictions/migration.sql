-- Phase D : prédictions — deviner la réponse de l'autre (§18).
-- Migration strictement additive : aucun retrait, applicable sans interruption.

ALTER TABLE "GameSession" ADD COLUMN "predictionsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable Prediction
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Prediction_roundId_userId_key" ON "Prediction"("roundId", "userId");
CREATE INDEX "Prediction_roundId_idx" ON "Prediction"("roundId");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
