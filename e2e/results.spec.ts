import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { createSession, register, uniqueEmail } from "./helpers";

/** Joue une manche : prédictions (toujours le premier choix), réponses, révélation. */
async function playRound(drawer: Page, other: Page, sameChoice: boolean): Promise<void> {
  await drawer.getByTestId("draw").click();
  await expect(drawer.getByTestId("predict-option")).toHaveCount(4, { timeout: 20_000 });
  await drawer.getByTestId("predict-option").first().click();
  await expect(other.getByTestId("predict-option")).toHaveCount(4, { timeout: 20_000 });
  await other.getByTestId("predict-option").first().click();
  await expect(drawer.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
  await drawer.getByTestId("answer-option").first().click();
  await expect(other.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
  await other
    .getByTestId("answer-option")
    .nth(sameChoice ? 0 : 1)
    .click();
  await expect(drawer.getByTestId("reveal-result")).toBeVisible({ timeout: 30_000 });
}

test.describe("Boucle cœur", () => {
  test("réactions, conversation, bilan 6 cartes et rematch", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await register(pageA, uniqueEmail("coeur-a"), "Alice");
      const code = await createSession(pageA);

      await register(pageB, uniqueEmail("coeur-b"), "Bob");
      await pageB.getByTestId("join-code").fill(code);
      await pageB.getByTestId("join-session").click();
      await pageB.waitForURL(/\/game\//);

      await expect(pageA.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await pageA.getByTestId("start-session").click();
      await expect(pageA.getByTestId("progress")).toContainText("Carte 1 / 6");

      // Manches 1-2 alignées, 3-4 différentes, 5-6 alignées. Le tireur alterne.
      // Prédictions toujours sur le premier choix → connaissance 10/12.
      await playRound(pageA, pageB, true);
      await expect(pageA.getByTestId("prediction-result")).toContainText("Bien deviné", {
        timeout: 15_000,
      });

      // Réactions croisées sur la première révélation.
      await pageA.getByTestId("reaction-❤️").click();
      await pageB.getByTestId("reaction-🔥").click();
      await expect(pageA.getByTestId("partner-reaction")).toContainText("🔥", {
        timeout: 15_000,
      });

      await playRound(pageB, pageA, true);
      await playRound(pageA, pageB, false);

      // Divergence : Alice creuse avec « Pourquoi ce choix ? » + motivation.
      await expect(pageA.getByTestId("reveal-result")).toContainText("choisi différemment");
      await pageA.getByTestId("opener-pourquoi").click();
      await pageA.getByTestId("motivation-Culture").click();
      await expect(pageA.getByTestId("discussion")).toContainText("Culture", {
        timeout: 15_000,
      });

      await playRound(pageB, pageA, false);
      await playRound(pageA, pageB, true);

      // Dernière carte : la révélation bascule directement au bilan (§13, §22).
      await pageB.getByTestId("draw").click();
      await expect(pageB.getByTestId("predict-option")).toHaveCount(4, { timeout: 20_000 });
      await pageB.getByTestId("predict-option").first().click();
      await expect(pageA.getByTestId("predict-option")).toHaveCount(4, { timeout: 20_000 });
      await pageA.getByTestId("predict-option").first().click();
      await expect(pageB.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageB.getByTestId("answer-option").first().click();
      await expect(pageA.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });

// Soumettre la réponse via l'API directe
      console.log("Envoi réponse via API directe");
      const apiResponse = await pageA.evaluate(async () => {
        const pathParts = window.location.pathname.split("/");
        const sessionId = pathParts[2];
        
        // Récupérer l'état actuel pour avoir le roundId
        const sessionRes = await fetch(`/api/sessions/${sessionId}`);
        const sessionData = await sessionRes.json();
        const roundId = sessionData.currentRound?.id;
        
        if (!roundId) throw new Error("Pas de round actuel");
        
        const res = await fetch(`/api/sessions/${sessionId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roundId, choice: "Installé(e) avec une famille" }),
        });
        return { status: res.status, body: await res.json() };
      });
      console.log("Réponse API /answer direct:", apiResponse);
      
      // Attendre que l'état se propage
      await pageA.waitForTimeout(3000);

      // Attendre la révélation de la dernière manche (ou directement le bilan si reveal-result ne s'affiche pas)
      await Promise.race([
        expect(pageA.getByTestId("reveal-result")).toBeVisible({ timeout: 15_000 }),
        expect(pageA.getByTestId("results")).toBeVisible({ timeout: 30_000 }),
      ]);

      // Bilan automatique (§22).
      await expect(pageA.getByTestId("results")).toBeVisible({ timeout: 30_000 });
      await expect(pageB.getByTestId("results")).toBeVisible({ timeout: 30_000 });

      // Attendre que les données de bilan soient à jour (propagation SSE/polling)
      await pageA.waitForTimeout(5000);

      // Vérifier le détail des manches via l'API
      const roundsData = await pageA.evaluate(async () => {
        const pathParts = window.location.pathname.split("/");
        const sessionId = pathParts[2];
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();
        return data.rounds;
      });
      console.log("Manches détaillées:", JSON.stringify(roundsData, null, 2));
      
      await expect(pageA.getByTestId("result-common")).toContainText("4");
      await expect(pageA.getByTestId("result-different")).toContainText("2");
      await expect(pageA.getByTestId("result-knowledge")).toContainText("10");
      await expect(pageA.getByTestId("result-surprises")).toContainText("2");
      await expect(pageA.getByTestId("result-conversations")).toContainText("1");
      await expect(pageA.getByTestId("result-reactions")).toContainText("2");

      // Rematch : nouvelle partie sur le même duo, même code.
      await expect(pageA.getByTestId("rematch")).toBeVisible({ timeout: 10_000 });
      const firstUrl = pageA.url();
      await pageA.getByTestId("rematch").click();
      await pageA.waitForURL((url) => url.pathname.startsWith("/game/") && url.href !== firstUrl);
      await expect(pageA.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByTestId("topbar-code")).toContainText(code);
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});