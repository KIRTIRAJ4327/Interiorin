import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
  await expect(page.getByText(/Phone controller (authenticated|recovered)/)).toBeVisible();
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
  await expect(page.locator(".phone-file")).toHaveCSS("min-height", "72px");
  await expect(page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).resolves.toBe(true);
  await page.screenshot({ path: testInfo.outputPath("paired-phone-pixel7.png"), fullPage: true });
});

test("phone intake generates the same canonical options on the Studio Wall", async ({ page, context }, testInfo) => {
  test.slow();
  test.skip(testInfo.project.name !== "chromium", "The paired intake proof runs once with both surfaces in one browser context.");
  await page.goto("/wall");
  await page.getByRole("button", { name: "Create Studio Wall" }).click();
  await expect(page).toHaveURL(/\/wall\/[0-9a-f-]+$/);
  const stored = await page.evaluate(() => {
    const id = location.pathname.split("/").at(-1);
    return sessionStorage.getItem(`interiorin:created:${id}`);
  });
  const joinUrl = (JSON.parse(stored!) as { joinUrl: string }).joinUrl;
  const phone = await context.newPage();
  await phone.route("**/api/space-analysis", async (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ status: "provider_unavailable", disclosure: "Visual analysis unavailable in this test; entered dimensions remain usable." }) }));
  await phone.goto(joinUrl);
  await expect(phone.getByRole("heading", { name: "Show us the room. You keep control of the facts." })).toBeVisible();
  await phone.locator('input[type="file"]').setInputFiles({
    name: "room.svg", mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#d8d0c3"/><rect y="520" width="1200" height="280" fill="#a58c68"/><rect x="120" y="180" width="430" height="320" fill="#f5f0e7"/></svg>'),
  });
  await expect(phone.getByRole("img", { name: "Normalized room source preview" })).toBeVisible();
  await phone.getByRole("button", { name: /Continue to brief/ }).click();
  await expect(phone.getByRole("heading", { name: "Tell us how life should feel here." })).toBeVisible();
  await expect(phone.getByRole("button", { name: /Push to talk for/ })).toHaveCount(4);
  await phone.getByRole("textbox", { name: "What should this room support?" }).fill("Family conversation, reading, and a calm evening routine");
  await phone.getByRole("textbox", { name: "How should it feel?" }).fill("Warm, calm, tactile, and uncluttered");
  await phone.getByRole("textbox", { name: "What must remain?" }).fill("Keep the existing sofa and clear access to the window");
  await phone.getByRole("textbox", { name: "What should improve or be avoided?" }).fill("Improve circulation and avoid bulky furniture");
  await phone.getByRole("button", { name: /Generate three directions/ }).click();
  await expect(phone.getByRole("heading", { name: "Choose the direction worth refining." })).toBeVisible();
  await expect(phone.locator(".phone-options button")).toHaveCount(3);
  await expect(page.locator("#wall-options-title")).toHaveText("Clear Passage");
  await phone.getByRole("button", { name: /Conversation Island/ }).click();
  await expect(page.locator("#wall-options-title")).toHaveText("Conversation Island");
  await expect(page.locator(".wall-canvas canvas")).toBeVisible();
  const tableX = async () => page.evaluate(() => {
    const id = location.pathname.split("/").at(-1);
    const snapshot = JSON.parse(localStorage.getItem(`interiorin:session:${id}`) ?? "{}");
    const state = snapshot.canonicalState;
    const option = state.options.find((candidate: { id: string }) => candidate.id === state.selectedOptionId);
    return option.scene.objects.find((object: { id: string }) => object.id === "table").transform.position.x as number;
  });
  const beforeX = await tableX();
  await phone.getByRole("textbox", { name: "Version name" }).fill("Conversation base");
  await phone.getByRole("button", { name: "Save version" }).click();
  await expect(phone.locator(".phone-versions li").filter({ hasText: "Conversation base" })).toBeVisible();
  await phone.getByRole("textbox", { name: "Refinement request" }).fill("Move the table right 30 cm");
  await phone.getByRole("button", { name: "Check proposed change" }).click();
  await expect(phone.getByRole("heading", { name: "Approve only the checked action." })).toBeVisible();
  await expect(phone.getByText("Deterministic checks passed")).toBeVisible();
  await expect(page.getByText("awaiting approval")).toBeVisible();
  await phone.getByRole("button", { name: "Approve checked action" }).click();
  await expect(phone.getByText("committed", { exact: true })).toBeVisible();
  await expect(page.getByText("committed", { exact: true })).toBeVisible();
  expect(await tableX()).toBeCloseTo(beforeX + 0.3, 5);
  const committedX = await tableX();
  await phone.getByRole("textbox", { name: "Version name" }).fill("Table shifted");
  await phone.getByRole("button", { name: "Save version" }).click();
  await expect(phone.locator(".phone-versions li").filter({ hasText: "Table shifted" })).toBeVisible();
  await phone.getByRole("button", { name: "Compare on wall" }).click();
  await expect(page.getByRole("heading", { name: "Conversation base versus Table shifted" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Authoritative scene changes from Conversation base to Table shifted" })).toContainText("Moved");
  await expect(page.locator(".wall-compare figure")).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Conversation base versus Table shifted" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Authoritative scene changes from Conversation base to Table shifted" })).toContainText("Moved");
  await phone.getByRole("textbox", { name: "Refinement request" }).fill("Move the table right 10 m");
  await phone.getByRole("button", { name: "Check proposed change" }).click();
  await expect(phone.locator(".phone-proposal[data-status='rejected']")).toContainText("outside the entered space envelope");
  expect(await tableX()).toBeCloseTo(committedX, 5);
  await phone.getByRole("textbox", { name: "Refinement request" }).fill("Move it over");
  await phone.getByRole("button", { name: "Check proposed change" }).click();
  await expect(phone.locator(".phone-proposal[data-status='clarification']")).toContainText("Name a visible object");
  expect(await tableX()).toBeCloseTo(committedX, 5);
  await phone.locator(".phone-review-select button").filter({ hasText: "Table shifted" }).click();
  await expect(page.locator("#wall-options-title")).toHaveText("Architect review");
  await expect(page.locator(".review-sheet")).toContainText("not construction documentation");
  await expect(page.getByRole("heading", { name: "Object schedule" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decision receipts" })).toBeVisible();
  await expect(page.locator(".review-sheet")).toContainText("outside the entered space envelope");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download structured JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("table-shifted-concept-review.json");
  const downloadedPath = await download.path();
  const handoff = JSON.parse(await readFile(downloadedPath!, "utf8")) as { packageType: string; selectedVersion: { name: string; scene: { objects: unknown[] } }; objectSchedule: unknown[]; disclosure: string };
  expect(handoff.packageType).toBe("architect_concept_review");
  expect(handoff.selectedVersion.name).toBe("Table shifted");
  expect(handoff.objectSchedule).toHaveLength(handoff.selectedVersion.scene.objects.length);
  expect(handoff.disclosure).toContain("not construction documentation");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".wall-header")).toBeHidden();
  await expect(page.locator(".review-sheet")).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.screenshot({ path: testInfo.outputPath("paired-generated-wall.png"), fullPage: true });
  await phone.screenshot({ path: testInfo.outputPath("paired-generated-phone.png"), fullPage: true });
});
