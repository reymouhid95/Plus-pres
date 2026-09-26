-- Phase A : modèle Duo + joueurs invités (cahier §29, §32, §33)

-- CreateTable Duo
CREATE TABLE "Duo" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Duo_pkey" PRIMARY KEY ("id")
);

-- CreateTable DuoMember
CREATE TABLE "DuoMember" (
    "id" TEXT NOT NULL,
    "duoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuoMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Duo_code_key" ON "Duo"("code");
CREATE UNIQUE INDEX "DuoMember_duoId_userId_key" ON "DuoMember"("duoId", "userId");
CREATE INDEX "DuoMember_userId_idx" ON "DuoMember"("userId");

-- Joueurs invités : identifiants nullables (§29 auth progressive, flux en Phase B)
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false;

-- Rattachement des sessions au duo
ALTER TABLE "GameSession" ADD COLUMN "duoId" TEXT;

-- Backfill : un Duo par session existante (code repris, statut dérivé)
WITH new_duos AS (
  INSERT INTO "Duo" ("id", "code", "status", "createdAt")
  SELECT gen_random_uuid()::text, "code",
         CASE WHEN "partnerId" IS NULL THEN 'pending' ELSE 'ready' END,
         "createdAt"
  FROM "GameSession"
  RETURNING "id", "code"
)
UPDATE "GameSession" gs
SET "duoId" = new_duos."id"
FROM new_duos
WHERE gs."code" = new_duos."code";

INSERT INTO "DuoMember" ("id", "duoId", "userId", "role", "joinedAt")
SELECT gen_random_uuid()::text, gs."duoId", gs."hostId", 'host', gs."createdAt"
FROM "GameSession" gs;

INSERT INTO "DuoMember" ("id", "duoId", "userId", "role", "joinedAt")
SELECT gen_random_uuid()::text, gs."duoId", gs."partnerId", 'partner', gs."createdAt"
FROM "GameSession" gs
WHERE gs."partnerId" IS NOT NULL;

ALTER TABLE "GameSession" ALTER COLUMN "duoId" SET NOT NULL;
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_duoId_fkey" FOREIGN KEY ("duoId") REFERENCES "Duo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey DuoMember -> Duo / User
ALTER TABLE "DuoMember" ADD CONSTRAINT "DuoMember_duoId_fkey" FOREIGN KEY ("duoId") REFERENCES "Duo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DuoMember" ADD CONSTRAINT "DuoMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Retrait des colonnes session-centriques (destructif, validé en Phase A)
ALTER TABLE "GameSession" DROP CONSTRAINT "GameSession_hostId_fkey";
ALTER TABLE "GameSession" DROP CONSTRAINT "GameSession_partnerId_fkey";
DROP INDEX "GameSession_code_key";
ALTER TABLE "GameSession" DROP COLUMN "code";
ALTER TABLE "GameSession" DROP COLUMN "hostId";
ALTER TABLE "GameSession" DROP COLUMN "partnerId";
