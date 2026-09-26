import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { questions } from "../src/data/questions";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  await prisma.question.deleteMany();
  await prisma.question.createMany({
    data: questions.map((q) => ({
      level: q.level,
      text: q.text,
      options: q.options,
      category: q.category ?? null,
      active: q.active ?? true,
      type: q.type ?? "single",
      scaleMin: q.scaleMin ?? null,
      scaleMax: q.scaleMax ?? null,
    })),
  });
  console.log(`${questions.length} questions insérées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
