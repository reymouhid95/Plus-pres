import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { createSession, register, uniqueEmail } from "./helpers";

async function readCountdown(page: Page): Promise<string | null> {
  const text = await page.getByTestId("countdown").innerText();
  const match = text.match(/(\d+:\d\d)/);
  return match ? match[1] : null;
}

test.describe("Partie", () => {
  test("deux joueurs parcourent une manche complète", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      // Le flux SSE doit répondre dès l'ouverture de la page de jeu.
      const streamOpened = pageA.waitForResponse(
        (res) => res.url().endsWith("/stream") && res.status() === 200,
        { timeout: 20_000 },
      );

      await register(pageA, uniqueEmail("alice"), "Alice");
      const code = await createSession(pageA);

      const streamResponse = await streamOpened;
      expect(streamResponse.headers()["content-type"]).toContain("text/event-stream");

      await register(pageB, uniqueEmail("bob"), "Bob");
      await pageB.getByTestId("join-code").fill(code);
      await pageB.getByTestId("join-session").click();
      await pageB.waitForURL(/\/game\//);

      await expect(pageA.getByText("avec Bob")).toBeVisible({ timeout: 30_000 });

      // Lobby : les deux joueurs sont prêts, Alice démarre l'expérience.
      await expect(pageA.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByText("Les deux joueurs sont prêts.")).toBeVisible();
      await expect(pageB.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await pageA.getByTestId("start-session").click();

      // Le tirage revient à Alice (elle a créé la partie).
      const draw = pageA.getByTestId("draw");
      await expect(draw).toBeVisible({ timeout: 30_000 });
      await draw.click();

      const optionsA = pageA.getByTestId("answer-option");
      await expect(optionsA).toHaveCount(4, { timeout: 20_000 });

      // Le compte à rebours démarre au tirage et décroît.
      const countdown = pageA.getByTestId("countdown");
      await expect(countdown).toBeVisible();
      const before = await readCountdown(pageA);
      expect(before).toMatch(/^\d+:\d\d$/);
      await pageA.waitForTimeout(1_600);
      expect(await readCountdown(pageA)).not.toBe(before);

      await optionsA.first().click();
      await expect(pageA.getByText("Réponse enregistrée")).toBeVisible();

      // Bob répond avec un autre choix pour provoquer une non-concordance.
      const optionsB = pageB.getByTestId("answer-option");
      await expect(optionsB).toHaveCount(4, { timeout: 20_000 });
      await optionsB.nth(1).click();

      // La révélation doit arriver par le flux (~500 ms), pas par le polling.
      await expect(pageA.getByTestId("reveal-result")).toBeVisible({ timeout: 2_000 });
      await expect(pageA.getByTestId("reveal-result")).toContainText(
        "choisi différemment",
      );
      // §43.2 : aucun score affiché pendant la partie.
      await expect(pageA.getByTestId("compatibility")).toHaveCount(0);

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
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
