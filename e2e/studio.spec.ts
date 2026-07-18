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

test("uploaded source observations become visible, non-metric scene evidence", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One browser is sufficient for the multimodal response contract.");
  await page.route("**/api/concept-render", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      status: "generated",
      disclosure: "Nano Banana presentation hypothesis; canonical geometry remains authoritative.",
      imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDEyMDAgODAwIj48cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiNkOGQyYzMiLz48cmVjdCB4PSI4MCIgeT0iNDgwIiB3aWR0aD0iMTA0MCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNhN2E3OTYiLz48cmVjdCB4PSIxNjAiIHk9IjQyMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxNDAiIGZpbGw9IiM0YzYyNTgiLz48Y2lyY2xlIGN4PSI3NjAiIGN5PSI1MjAiIHI9IjEyMCIgZmlsbD0iI2I2NzQ1YSIvPjxwYXRoIGQ9Ik0xNjAgNDIwIDQwMCAyNjAgNTYwIDQyMCIgZmlsbD0iI2Y3ZjRmMCIgc3Ryb2tlPSIjMjEyNjIyIiBzdHJva2Utd2lkdGg9IjEyIi8+PC9zdmc+",
      model: "gemini-contract-fixture",
      createdAt: "2026-07-18T12:00:00.000Z",
    }),
  }));
  await page.route("**/api/space-analysis", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      status: "analyzed",
      disclosure: "Gemini identified visible cues only. Entered measurements remain the sole metric authority.",
      model: "gemini-contract-fixture",
      analysis: {
        spaceKind: "interior",
        spaceType: "living room",
        summary: "A bright living room with a rear window and fixed bench.",
        confidence: "medium",
        openings: [{ kind: "window", label: "Rear window", position: "center", confidence: "high" }],
        retainedObjects: [{ label: "Fixed bench", category: "seating", position: "left", confidence: "high", likelyMovable: false }],
        styleCues: [{ label: "warm timber", confidence: "medium" }],
        naturalLight: { level: "high", note: "Strong daylight at the rear.", confidence: "high" },
        reviewRisks: [],
        clarificationQuestions: ["Measure the window opening."],
        metricWarning: "No metric dimensions were inferred from the uncalibrated source.",
      },
    }),
  }));
  await page.goto("/studio");
  await page.getByLabel(/optional photo or plan reference/i).setInputFiles({
    name: "real-room.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#d8d2c3"/><rect y="330" width="800" height="170" fill="#a7a796"/><rect x="80" y="120" width="260" height="210" fill="#f7f4f0" stroke="#212622" stroke-width="10"/><rect x="430" y="280" width="260" height="100" fill="#4c6258"/></svg>'),
  });
  await expect(page.getByRole("img", { name: "Selected space reference preview" })).toBeVisible();
  await page.getByRole("button", { name: /generate three spatial directions/i }).click();

  await expect(page.getByText(/visible-space read · medium confidence/i)).toBeVisible();
  await expect(page.getByText(/1 retained object · 1 opening/i)).toBeVisible();
  await expect(page.getByText("Measure the window opening.")).toBeVisible();
  await expect(page.getByText(/No metric dimensions were inferred/i)).toBeVisible();
  await page.getByRole("button", { name: "Generate in-space concept" }).click();
  await expect(page.getByRole("img", { name: "AI-generated in-space concept for Clear Passage" })).toBeVisible();
  await expect(page.getByText(/AI presentation concept · not measured/i)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("analyzed-source-studio.png"), fullPage: true });
});

test("refinement reports footprint impact and supports typed undo", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One browser is sufficient for the deterministic validation contract.");
  await page.goto("/studio");
  await page.getByRole("button", { name: "Empty space" }).click();
  await page.getByRole("button", { name: /generate three spatial directions/i }).click();

  await expect(page.getByText("Conflict found")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /needs clearance review/i })).toBeVisible();
  await page.getByLabel("Command").fill("Move the table right 10 m");
  await page.getByRole("button", { name: "Compile action" }).click();
  await page.getByRole("button", { name: /commit checked action/i }).click();
  await expect(page.locator(".action-receipts").getByText("rejected")).toBeVisible();
  await expect(page.locator(".action-receipts")).toContainText("outside the entered space envelope");

  await page.getByLabel("Command").fill("Make the room warm and bright");
  await page.getByRole("button", { name: "Compile action" }).click();
  await page.getByRole("button", { name: /commit checked action/i }).click();
  await expect(page.locator(".action-receipts")).toContainText("Environment set to warm, bright");
  await page.getByLabel("Command").fill("Undo that");
  await page.getByRole("button", { name: "Compile action" }).click();
  await page.getByRole("button", { name: /commit checked action/i }).click();
  await expect(page.locator(".action-receipts")).toContainText("Restored the previous committed canonical scene");
  await page.getByLabel("Command").fill("Replace the sofa with a compact two-seat sofa");
  await page.getByRole("button", { name: "Compile action" }).click();
  await expect(page.getByText("Replace Suggested sofa with compact two-seat sofa.")).toBeVisible();
  await page.getByRole("button", { name: /commit checked action/i }).click();
  await expect(page.locator(".action-receipts")).toContainText("can be replaced with the checked variant");
});
