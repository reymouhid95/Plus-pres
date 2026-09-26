import { expect, test } from "@playwright/test";
import { register, uniqueEmail } from "./helpers";

test.describe("Profil", () => {
  test("modifier son profil affiche une confirmation", async ({ page }) => {
    await register(page, uniqueEmail("profil"), "Camille");

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Votre profil" })).toBeVisible();

    await page.getByPlaceholder("Votre prénom").fill("Cami");
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();

    await expect(page.getByRole("main").getByText("Profil mis à jour.")).toBeVisible();
    await expect(page.getByRole("status").getByText("Profil mis à jour.")).toBeVisible();

    await page.reload();
    await expect(page.getByPlaceholder("Votre prénom")).toHaveValue("Cami");
  });
});
