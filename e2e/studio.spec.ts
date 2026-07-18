import { expect, test } from "@playwright/test";

test("studio turns an entered interior envelope into inspectable versions and handoff", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("heading", { name: "Start with the space you have." })).toBeVisible();

  await page.getByLabel("Project name").fill("North room study");
  await page.getByLabel("Width metres").fill("6.4");
  await page.getByLabel("Depth metres").fill("4.8");
  await page.getByRole("button", { name: /generate three spatial directions/i }).click();

  const directions = page.getByRole("radio");
  await expect(directions).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Clear Passage" })).toBeVisible();
  await expect(page.getByText(/user-declared · 6.4 × 4.8 m/i)).toBeVisible();

  await page.getByLabel("Command").fill("Move the table right 30 cm");
  await page.getByRole("button", { name: "Compile action" }).click();
  await expect(page.getByText(/typed action · review before commit/i)).toBeVisible();
  await expect(page.getByText("Move Central table right 300 mm.")).toBeVisible();
  await page.getByRole("button", { name: /commit checked action/i }).click();
  await expect(page.locator(".action-receipts").getByText("accepted")).toBeVisible();

  await page.getByLabel("Version name").fill("Circulation first");
  await page.getByRole("button", { name: /save factual version/i }).click();
  await directions.nth(1).click();
  await page.getByLabel("Version name").fill("Conversation option");
  await page.getByRole("button", { name: /save factual version/i }).click();

  await expect(page.getByRole("table", { name: /factual scene changes/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /export review package/i })).toBeEnabled();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /export review package/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("north-room-study-interiorin-handoff.json");

  await expect(page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: testInfo.outputPath("interior-studio.png"), fullPage: true });
});

test("exterior directions keep professional review boundaries visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One browser is sufficient for the exterior contract.");
  await page.goto("/studio");
  await page.getByRole("button", { name: "Exterior" }).click();
  await page.getByRole("button", { name: /generate three spatial directions/i }).click();

  await expect(page.getByRole("radio")).toHaveCount(3);
  await expect(page.getByText(/survey, setbacks, utilities, grade and drainage required/i)).toBeVisible();
  await expect(page.getByText(/property boundary/i).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("exterior-studio.png"), fullPage: true });
});
