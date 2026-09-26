import { execSync } from "node:child_process";

/**
 * Prépare la base de test avant la suite e2e :
 *   1. migrations (`migrate deploy`, sans toucher aux données existantes)
 *   2. purge des parties / rounds / answers (voir ./reset-db.ts)
 *   3. seed des 36 questions
 *
 * On refuse d'agir sur une base non locale : les e2e ne doivent jamais
 * toucher à Neon.
 */
export default function globalSetup() {
  const url = process.env.DATABASE_URL ?? "";
  const local = /@(?:localhost|127\.0\.0\.1)(?::\d+)?\//.test(url);
  if (!local && !process.env.CI) {
    throw new Error(
      `globalSetup refuse de purger une base non locale (${url.split("@")[1] ?? url}).`,
    );
  }

  const env = { ...process.env, DOTENV_CONFIG_PATH: process.env.ENV_FILE ?? ".env.test" };
  execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
  execSync("npx tsx e2e/reset-db.ts", { env, stdio: "inherit" });
  execSync("npx prisma db seed", { env, stdio: "inherit" });
}
