import { expect, test } from "@playwright/test";
import { PASSWORD, createSession, login, register, uniqueEmail } from "./helpers";

test.describe("Invitation", () => {
  test("un lien invalide affiche une erreur", async ({ page }) => {
    await page.goto("/join/XXXXXX");
    await expect(page.getByTestId("join-invalid")).toBeVisible();
    await expect(page.getByText("Aucun duo ne correspond au code")).toBeVisible();
  });

  test("un membre connecté rejoint via le lien sans ressaisir de code", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await register(pageA, uniqueEmail("invite-a"), "Alice");
      const code = await createSession(pageA);

      await register(pageB, uniqueEmail("invite-b"), "Bob");
      await pageB.goto(`/join/${code}`);
      await expect(pageB.getByText("Alice vous invite")).toBeVisible();
      await pageB.getByTestId("join-as-member").click();
      await pageB.waitForURL(/\/game\//);

      // Les deux joueurs se retrouvent au lobby.
      await expect(pageB.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await expect(pageB.getByText("Les deux joueurs sont prêts.")).toBeVisible();
      await expect(pageB.getByTestId("lobby-player")).toHaveCount(2);
      await expect(pageA.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });

      // Bob peut aussi démarrer ; le tirage revient à Alice (hôte).
      await pageB.getByTestId("start-session").click();
      await expect(pageA.getByTestId("draw")).toBeVisible({ timeout: 30_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("parcours invité : lien → pseudo → lobby → manche → conversion", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxGuest = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageGuest = await ctxGuest.newPage();

    try {
      await register(pageA, uniqueEmail("hote"), "Alice");
      const code = await createSession(pageA);

      // Lien d'invitation affiché sur l'écran d'attente.
      const inviteLink = pageA.getByTestId("invite-link");
      await expect(inviteLink).toBeVisible();
      expect(await inviteLink.innerText()).toContain(`/join/${code}`);

      // Gaston n'a pas de compte : un pseudo suffit.
      await pageGuest.goto(`/join/${code}`);
      await expect(pageGuest.getByText("Alice vous invite")).toBeVisible();
      await pageGuest.getByTestId("guest-name").fill("Gaston");
      await pageGuest.getByTestId("join-as-guest").click();
      await pageGuest.waitForURL(/\/game\//);

      // L'hôte est prévenue de l'arrivée, les deux voient le lobby.
      await expect(
        pageA.getByText("Gaston vient de rejoindre votre expérience"),
      ).toBeVisible({ timeout: 15_000 });
      await expect(pageGuest.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });

      // Une manche complète, même choix → alignés.
      await pageA.getByTestId("start-session").click();
      await pageA.getByTestId("draw").click();
      await expect(pageA.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageA.getByTestId("answer-option").first().click();
      await expect(pageGuest.getByTestId("answer-option")).toHaveCount(4, {
        timeout: 20_000,
      });
      await pageGuest.getByTestId("answer-option").first().click();
      await expect(pageGuest.getByTestId("reveal-result")).toContainText("alignés", {
        timeout: 30_000,
      });

      // Conversion : l'invité crée son compte, son histoire est conservée.
      const guestEmail = uniqueEmail("gaston");
      await pageGuest.goto("/dashboard");
      await expect(pageGuest.getByTestId("upgrade-banner")).toBeVisible();
      await pageGuest.getByTestId("upgrade-email").fill(guestEmail);
      await pageGuest.getByTestId("upgrade-password").fill(PASSWORD);
      await pageGuest.getByTestId("upgrade-submit").click();
      await expect(pageGuest.getByTestId("upgrade-banner")).toBeHidden({ timeout: 10_000 });

      // Déconnexion puis reconnexion avec le nouveau compte.
      await pageGuest.getByRole("button", { name: "Déconnexion" }).click();
      await pageGuest.waitForURL((url) => url.pathname === "/");
      await login(pageGuest, guestEmail);
      await expect(
        pageGuest.getByRole("heading", { name: "Bonjour, Gaston" }),
      ).toBeVisible();
      // L'historique de l'invité a suivi la conversion.
      await pageGuest.goto("/history");
      await expect(pageGuest.getByText("1 / 1 · 100 %")).toBeVisible();
    } finally {
      await ctxA.close();
      await ctxGuest.close();
    }
  });
});
