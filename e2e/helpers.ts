import { expect, type Page } from "@playwright/test";

export const PASSWORD = "motdepasse123";

export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@exemple.fr`;
}

/** Crée un compte depuis l'UI et s'arrête sur le tableau de bord. */
export async function register(page: Page, email: string, displayName: string): Promise<void> {
  await page.goto("/register");
  await page.getByPlaceholder("Camille").fill(displayName);
  await page.getByPlaceholder("vous@exemple.fr").fill(email);
  await page.getByPlaceholder("Votre mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: `Bonjour, ${displayName}` })).toBeVisible();
}

/** Se connecte avec un compte existant. */
export async function login(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("vous@exemple.fr").fill(email);
  await page.getByPlaceholder("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await page.waitForURL("**/dashboard");
}

/** Crée une partie depuis le tableau de bord et renvoie le code affiché. */
export async function createSession(page: Page): Promise<string> {
  await page.goto("/dashboard");
  await page.getByTestId("create-session").click();
  await page.waitForURL(/\/game\//);

  const code = page.getByTestId("session-code");
  await expect(code).toBeVisible();
  const raw = (await code.innerText()).replace(/\s+/g, "");
  expect(raw).toHaveLength(6);
  return raw;
}
