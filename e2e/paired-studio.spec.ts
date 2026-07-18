import { expect, test } from "@playwright/test";

test("same-device pairing is disclosed and the wall observes one controller", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The paired two-page proof runs once; mobile layout has a separate check.");
  await page.goto("/wall");
  await expect(page.getByRole("heading", { name: "Turn this laptop into the Studio Wall." })).toBeVisible();
  await page.getByRole("button", { name: "Create Studio Wall" }).click();
  await expect(page).toHaveURL(/\/wall\/[0-9a-f-]+$/);
  await expect(page.getByText(/Same-device demo mode/i)).toBeVisible();
  const storedSession = await page.evaluate(() => {
    const sessionId = location.pathname.split("/").at(-1);
    return sessionStorage.getItem(`interiorin:created:${sessionId}`);
  });
  const joinUrl = storedSession ? (JSON.parse(storedSession) as { joinUrl: string }).joinUrl : null;
  expect(joinUrl).toBeTruthy();

  const phone = await context.newPage();
  await phone.goto(joinUrl!);
  await expect(phone.getByText("Paired", { exact: true })).toBeVisible();
  await expect(phone.getByRole("heading", { name: "Show us the room. You keep control of the facts." })).toBeVisible();
  await expect(phone).not.toHaveURL(/token=/);

  await expect(page.getByText("Phone paired", { exact: true })).toBeVisible();
  await expect(page.getByText("Phone controller authenticated. The wall is ready for room intake.")).toBeVisible();
  await expect(page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: testInfo.outputPath("paired-wall.png"), fullPage: true });
  await phone.screenshot({ path: testInfo.outputPath("paired-phone.png"), fullPage: true });
});

test("phone controller is readable at Pixel 7 width", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "This is the mobile-specific layout proof.");
  await page.goto("/wall");
  await page.getByRole("button", { name: "Create Studio Wall" }).click();
  await expect(page).toHaveURL(/\/wall\/[0-9a-f-]+$/);
  const storedSession = await page.evaluate(() => {
    const sessionId = location.pathname.split("/").at(-1);
    return sessionStorage.getItem(`interiorin:created:${sessionId}`);
  });
  const joinUrl = storedSession ? (JSON.parse(storedSession) as { joinUrl: string }).joinUrl : null;
  await page.goto(joinUrl!);
  await expect(page.getByText("Paired", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Capture room photo/ })).toHaveCSS("min-height", "72px");
  await expect(page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: testInfo.outputPath("paired-phone-pixel7.png"), fullPage: true });
});
