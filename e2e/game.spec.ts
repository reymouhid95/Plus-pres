import { expect, test } from "@playwright/test";
import { createSession, register, uniqueEmail } from "./helpers";

test.describe("Partie", () => {
  test("deux joueurs parcourent une manche complète", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await register(pageA, uniqueEmail("alice"), "Alice");
      const code = await createSession(pageA);

      await register(pageB, uniqueEmail("bob"), "Bob");
      await pageB.getByTestId("join-code").fill(code);
      await pageB.getByTestId("join-session").click();
      await pageB.waitForURL(/\/game\//);

      await expect(pageA.getByText("avec Bob")).toBeVisible({ timeout: 30_000 });

      // Le tirage revient à Alice (elle a créé la partie).
      const draw = pageA.getByTestId("draw");
      await expect(draw).toBeVisible({ timeout: 30_000 });
      await draw.click();

      const optionsA = pageA.getByTestId("answer-option");
      await expect(optionsA).toHaveCount(4, { timeout: 20_000 });
      await optionsA.first().click();
      await expect(pageA.getByText("Réponse enregistrée")).toBeVisible();

      // Bob répond avec un autre choix pour provoquer une non-concordance.
      const optionsB = pageB.getByTestId("answer-option");
      await expect(optionsB).toHaveCount(4, { timeout: 20_000 });
      await optionsB.nth(1).click();

      await expect(pageA.getByTestId("reveal-result")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByTestId("reveal-result")).toContainText(
        "Réponses différentes",
      );
      await expect(pageA.getByTestId("compatibility")).toContainText("0 / 1 alignées");

      // Relance : c'est maintenant à Bob de tirer.
      await expect(pageB.getByTestId("draw")).toBeVisible({ timeout: 30_000 });
      await pageB.getByTestId("draw").click();
      await expect(pageB.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageB.getByTestId("answer-option").first().click();
      await expect(pageB.getByText("Réponse enregistrée")).toBeVisible();

      await expect(pageA.getByTestId("answer-option")).toHaveCount(4, { timeout: 30_000 });
      await pageA.getByTestId("answer-option").first().click();
      await expect(pageA.getByTestId("reveal-result")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByTestId("reveal-result")).toContainText("alignés");
      await expect(pageA.getByTestId("compatibility")).toContainText("1 / 2 alignées");
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
