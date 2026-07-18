import { expect, test } from "@playwright/test";

test("offline causal proof blocks, authorizes, limits, and commits", async ({ page }, testInfo) => {
  await page.goto("/proof/prepared-dining-room");
  await expect(page).toHaveURL(/\/proof\/prepared-dining-room$/);

  await expect(page.getByRole("heading", { name: "An estimate may block. It may never authorize." })).toBeVisible();
  const offline = page.getByRole("switch", { name: /offline proof mode/i });
  await offline.click();
  await expect(offline).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: /clarify and check/i }).click();

  await expect(page.getByText("Geometry is computable. Authority is not.")).toBeVisible();
  await expect(page.getByText("Prepared typed proposal")).toBeVisible();
  await expect(page.getByText("18 cm", { exact: false })).toHaveCount(0);

  const recordMeasurement = page.getByRole("button", { name: /record measurement/i });
  await expect(recordMeasurement).toBeDisabled();
  await page.getByRole("checkbox", { name: /i measured this 100 cm value/i }).check();
  await expect(recordMeasurement).toBeEnabled();
  await recordMeasurement.click();
  await expect(page.getByRole("heading", { name: "Only evidence authority changed." })).toBeVisible();
  await expect(page.locator(".relationships strong")).toHaveText(["MATCH", "MATCH", "1 FIELD"]);
  await expect(page.getByText("Hashed")).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath("studio-proof.png"), fullPage: true });

  await page.getByRole("button", { name: /rerun unchanged proposal/i }).click();
  await expect(page.getByText("40 cm fails. 18 cm passes.")).toBeVisible();
  await page.getByRole("button", { name: /accept 18 cm alternative/i }).click();

  await expect(page.getByText("The checked alternative is now canonical.")).toBeVisible();
  await expect(page.getByText("+180 mm", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Five authorizing bases")).toBeVisible();
  await expect(page.locator(".receipt").getByText("Prepared fallback · no model request")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("studio-receipt.png"), fullPage: true });
});
