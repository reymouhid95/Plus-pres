import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Remet le contenu de la base de test à zéro sans toucher au schéma :
 * les specs laissent des parties / rounds / answers derrière elles, et le seed
 * (`question.deleteMany`) échoue dès qu'un round référence encore une question.
 *
 * Ordre imposé par les clés étrangères : answers → rounds → sessions.
 * Les comptes sont conservés (les e-mails sont uniques par exécution).
 */
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await db.answer.deleteMany();
  await db.round.deleteMany();
  await db.gameSession.deleteMany();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
