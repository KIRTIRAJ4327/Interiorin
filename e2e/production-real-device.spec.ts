import { expect, test } from "@playwright/test";

test("a separately authenticated phone synchronizes intake and design with the production wall", async ({ page, browser }) => {
  test.setTimeout(120_000);

  await page.goto("/wall");
  await page.getByRole("button", { name: "Create Studio Wall" }).click();
  await expect(page).toHaveURL(/\/wall\/[0-9a-f-]+$/);
  await expect(page.getByText(/Private paired session|Authenticated phone/i)).toBeVisible();

  const storedSession = await page.evaluate(() => {
    const sessionId = location.pathname.split("/").at(-1);
    return sessionStorage.getItem(`interiorin:created:${sessionId}`);
  });
  expect(storedSession).toBeTruthy();
  const joinUrl = (JSON.parse(storedSession!) as { joinUrl: string; mode: string }).joinUrl;
  expect(JSON.parse(storedSession!) as { mode: string }).toMatchObject({ mode: "supabase" });

  const phoneContext = await browser.newContext({
    ...test.info().project.use,
    viewport: { width: 412, height: 915 },
  });
  const phone = await phoneContext.newPage();
  await phone.route("**/api/space-analysis", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      status: "provider_unavailable",
      disclosure: "Visual analysis unavailable in this production synchronization proof; entered dimensions remain authoritative.",
    }),
  }));

  await phone.goto(joinUrl);
  await expect(phone.getByText("Paired", { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Phone paired", { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(phone).not.toHaveURL(/token=/);

  await phone.getByRole("button", { name: /Use demo room/ }).click();
  await expect(phone.getByRole("img", { name: "Interiorin demo living room preview" })).toBeVisible();
  await phone.getByRole("button", { name: "Use this room" }).click();
  await expect(phone.getByRole("heading", { name: "Tell us how life should feel here." })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Room intake synchronized/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/5\.2.*4\.0.*2\.7/)).toBeVisible();

  await phone.getByRole("textbox", { name: "What should this room support?" }).fill("Family conversation, reading, and calm evenings");
  await phone.getByRole("textbox", { name: "How should it feel?" }).fill("Warm, calm, tactile, and uncluttered");
  await phone.getByRole("textbox", { name: "What must remain?" }).fill("Keep clear access to the window and balcony door");
  await phone.getByRole("textbox", { name: "What should improve or be avoided?" }).fill("Improve circulation and avoid bulky furniture");
  await phone.getByRole("button", { name: "Confirm my brief" }).click();

  await expect(phone.getByRole("heading", { name: "Choose the direction worth refining." })).toBeVisible({ timeout: 25_000 });
  await expect(page.locator("#wall-options-title")).toHaveText("Clear Passage", { timeout: 25_000 });
  await phone.getByRole("button", { name: /Conversation Island/ }).click();
  await expect(page.locator("#wall-options-title")).toHaveText("Conversation Island", { timeout: 20_000 });
  await expect(page.locator(".wall-canvas canvas")).toBeVisible();

  await phoneContext.close();
});
