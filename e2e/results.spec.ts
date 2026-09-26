import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { createSession, register, uniqueEmail } from "./helpers";

/** Joue une manche : le tireur pioche, les deux répondent, la révélation arrive. */
async function playRound(drawer: Page, other: Page, sameChoice: boolean): Promise<void> {
  await drawer.getByTestId("draw").click();
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
      await playRound(pageA, pageB, true);

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
      await expect(pageB.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageB.getByTestId("answer-option").first().click();
      await expect(pageA.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageA.getByTestId("answer-option").first().click();

      // Bilan automatique (§22).
      await expect(pageA.getByTestId("results")).toBeVisible({ timeout: 30_000 });
      await expect(pageB.getByTestId("results")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByTestId("result-common")).toContainText("4");
      await expect(pageA.getByTestId("result-different")).toContainText("2");
      await expect(pageA.getByTestId("result-conversations")).toContainText("1");
      await expect(pageA.getByTestId("result-reactions")).toContainText("2");

      // Rematch : nouvelle partie sur le même duo, même code.
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
