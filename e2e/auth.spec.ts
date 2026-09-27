import { expect, test } from "@playwright/test";
import { PASSWORD, login, register, uniqueEmail } from "./helpers";

test.describe("Authentification", () => {
  test("redirige vers /login quand on n'est pas connecté", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
    await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();
  });

  test("s'inscrire, se déconnecter puis se reconnecter", async ({ page }) => {
    const email = uniqueEmail("auth");

    await register(page, email, "Alice");
    await expect(page.getByText("Vos parties")).toBeVisible();

    await page.getByRole("button", { name: "Déconnexion" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await expect(page.getByRole("banner").getByRole("link", { name: "Se connecter" })).toBeVisible();

    await login(page, email);
    await expect(page.getByRole("heading", { name: "Bonjour, Alice" })).toBeVisible();
  });

  test("refuse un mot de passe erroné sur /login", async ({ page }) => {
    const email = uniqueEmail("auth-ko");

    await register(page, email, "Bob");
    await page.getByRole("button", { name: "Déconnexion" }).click();
    await page.waitForURL((url) => url.pathname === "/");

    await page.goto("/login");
    await page.getByPlaceholder("vous@exemple.fr").fill(email);
    await page.getByPlaceholder("Mot de passe").fill(`${PASSWORD}x`);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
  });
});
