import "dotenv/config";
import { defineConfig } from "prisma/config";

// Les migrations utilisent l'URL directe (non poolée) : le pooler Neon
// n'accepte pas les `prisma migrate`. Le client, lui, se connecte via
// DATABASE_URL dans src/lib/db.ts.
const migrationsUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationsUrl,
  },
});
