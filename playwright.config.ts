import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// La base de test locale (Docker, port 5433) est décrite dans .env.test :
// elle est chargée avant tout pour que le serveur lancé par Playwright
// ne touche jamais à Neon.
loadEnv({ path: process.env.ENV_FILE ?? ".env.test" });

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Une seule base partagée : on joue les specs en séquence.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 20_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      DIRECT_URL: process.env.DIRECT_URL ?? "",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
      NEXTAUTH_URL: baseURL,
      // Les e2e créent bien plus de comptes que la limite prod (5/15 min)
      RATE_LIMIT_AUTH_MAX: "500",
      RATE_LIMIT_GAME_MAX: "500",
    },
  },
});
