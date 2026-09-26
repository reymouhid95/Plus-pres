import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { createSession, register, uniqueEmail } from "./helpers";

test.describe("Historique", () => {
  test("redirige vers /login quand on n'est pas connecté", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fhistory/);
  });

  test("affiche les stats, la carte exportable et la revue de partie", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      // Une manche complète, jouée par les deux joueurs avec le même choix.
      await register(pageA, uniqueEmail("hist-a"), "Alice");
      const code = await createSession(pageA);

      await register(pageB, uniqueEmail("hist-b"), "Bob");
      await pageB.getByTestId("join-code").fill(code);
      await pageB.getByTestId("join-session").click();
      await pageB.waitForURL(/\/game\//);
      await expect(pageA.getByText("avec Bob")).toBeVisible({ timeout: 30_000 });

      await expect(pageA.getByTestId("lobby")).toBeVisible({ timeout: 30_000 });
      await pageA.getByTestId("start-session").click();

      await pageA.getByTestId("draw").click();
      await expect(pageA.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageA.getByTestId("answer-option").first().click();
      await expect(pageB.getByTestId("answer-option")).toHaveCount(4, { timeout: 20_000 });
      await pageB.getByTestId("answer-option").first().click();

      await expect(pageA.getByTestId("reveal-result")).toBeVisible({ timeout: 30_000 });
      await expect(pageA.getByTestId("reveal-result")).toContainText("alignés");

      // Historique
      await pageA.goto("/history");
      await expect(pageA.getByRole("heading", { name: "Votre évolution" })).toBeVisible();
      await expect(pageA.getByRole("heading", { name: "Vos parties" })).toBeVisible();
      await expect(pageA.getByRole("heading", { name: "Courbe" })).toBeVisible();
      await expect(pageA.getByText("1 / 1 · 100 %")).toBeVisible();
      await expect(pageA.getByText("Bob", { exact: true })).toBeVisible();

      // Carte de résultat exportée en PNG
      await expect(pageA.getByTestId("share-card")).toBeVisible();
      const downloadPromise = pageA.waitForEvent("download");
      await pageA.getByTestId("download-card").click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/^plus-pres-\d{4}-\d{2}-\d{2}\.png$/);
      const filePath = await download.path();
      expect(filePath).not.toBeNull();
      expect(fs.statSync(filePath!).size).toBeGreaterThan(2_000);

      // Revue de partie, atteinte depuis la ligne de l'historique
      await pageA.getByRole("link", { name: /Bob/ }).first().click();
      await pageA.waitForURL(/\/review$/);

      await expect(pageA.getByRole("heading", { name: `Code ${code}` })).toBeVisible();
      await expect(pageA.getByTestId("review-verdict")).toContainText("Alignés");
      await expect(pageA.getByText("Vous")).toBeVisible();
      await expect(pageA.getByText("Rejouer cette partie")).toBeVisible();
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
