import { chromium } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_PRODUCTION_URL ?? "https://interiorin-beta.vercel.app";
const browser = await chromium.launch({ headless: true });

try {
  const wallContext = await browser.newContext();
  const wall = await wallContext.newPage();
  await wall.goto(`${baseUrl}/wall`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await wall.getByRole("button", { name: "Create Studio Wall" }).click();
  await wall.waitForURL(/\/wall\/[0-9a-f-]+$/, { timeout: 30_000 });

  const rawSession = await wall.evaluate(() => {
    const sessionId = location.pathname.split("/").at(-1);
    return sessionStorage.getItem(`interiorin:created:${sessionId}`);
  });
  if (!rawSession) throw new Error("Wall did not retain the created session envelope.");
  const session = JSON.parse(rawSession);
  console.log(`session_mode=${session.mode}`);
  if (session.mode !== "supabase") throw new Error("Production created a same-device session instead of a verified Supabase session.");

  const phoneContext = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const phone = await phoneContext.newPage();
  await phone.route("**/api/space-analysis", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      status: "provider_unavailable",
      disclosure: "Analysis bypassed only for the production transport probe; entered dimensions remain authoritative.",
    }),
  }));
  await phone.goto(session.joinUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await phone.getByText("Paired", { exact: true }).waitFor({ timeout: 30_000 });
  await wall.getByText("Phone paired", { exact: true }).waitFor({ timeout: 30_000 });
  console.log("phone_pairing=passed");

  await phone.getByRole("button", { name: /Use demo room/ }).click();
  await phone.getByRole("img", { name: "Interiorin demo living room preview" }).waitFor({ timeout: 20_000 });
  await phone.getByRole("button", { name: "Use this room" }).click();
  await phone.getByRole("heading", { name: "Tell us how life should feel here." }).waitFor({ timeout: 30_000 });
  console.log("phone_intake=passed");

  await wall.getByText(/Room intake synchronized/i).waitFor({ timeout: 30_000 });
  await wall.getByText(/5\.2.*4\.0.*2\.7/).waitFor({ timeout: 20_000 });
  console.log("wall_synchronization=passed");

  const voiceStatus = await phone.evaluate(async ({ sessionId }) => {
    const authEntry = Object.entries(localStorage).find(([key]) => key.startsWith("sb-") && key.endsWith("-auth-token"));
    if (!authEntry) return 0;
    const auth = JSON.parse(authEntry[1]);
    const accessToken = auth.access_token ?? auth.currentSession?.access_token;
    if (!accessToken) return 0;
    const response = await fetch(`/api/sessions/${sessionId}/voice-session`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    return response.status;
  }, { sessionId: session.sessionId });
  if (voiceStatus !== 200) throw new Error(`Authenticated ElevenLabs voice-session endpoint returned ${voiceStatus}.`);
  console.log("elevenlabs_signed_session=passed");

  await phone.getByRole("textbox", { name: "What should this room support?" }).fill("Family conversation, reading, and calm evenings");
  await phone.getByRole("textbox", { name: "How should it feel?" }).fill("Warm, calm, tactile, and uncluttered");
  await phone.getByRole("textbox", { name: "What must remain?" }).fill("Keep clear access to the window and balcony door");
  await phone.getByRole("textbox", { name: "What should improve or be avoided?" }).fill("Improve circulation and avoid bulky furniture");
  await phone.getByRole("button", { name: "Confirm my brief" }).click();
  await phone.getByRole("heading", { name: "Choose the direction worth refining." }).waitFor({ timeout: 30_000 });
  await wall.locator("#wall-options-title").filter({ hasText: "Clear Passage" }).waitFor({ timeout: 30_000 });
  console.log("option_generation=passed");

  await phone.getByRole("button", { name: /Conversation Island/ }).click();
  await wall.locator("#wall-options-title").filter({ hasText: "Conversation Island" }).waitFor({ timeout: 30_000 });
  console.log("option_selection=passed");

  await phone.getByRole("textbox", { name: "Version name" }).fill("Conversation base");
  await phone.getByRole("button", { name: "Save version" }).click();
  await phone.locator(".phone-versions li").filter({ hasText: "Conversation base" }).waitFor({ timeout: 30_000 });
  await phone.getByRole("textbox", { name: "Refinement request" }).fill("Move the table right 30 cm");
  await phone.getByRole("button", { name: "Check this change" }).click();
  await phone.getByRole("button", { name: "Approve checked action" }).waitFor({ timeout: 30_000 });
  await phone.getByRole("button", { name: "Approve checked action" }).click();
  await wall.getByText("committed", { exact: true }).waitFor({ timeout: 30_000 });
  console.log("checked_refinement=passed");

  await phone.getByRole("textbox", { name: "Version name" }).fill("Table shifted");
  await phone.getByRole("button", { name: "Save version" }).click();
  await phone.locator(".phone-versions li").filter({ hasText: "Table shifted" }).waitFor({ timeout: 30_000 });
  await phone.getByRole("button", { name: "Compare on wall" }).click();
  await wall.getByRole("heading", { name: "Conversation base versus Table shifted" }).waitFor({ timeout: 30_000 });
  console.log("version_comparison=passed");

  await phoneContext.close();
  await wallContext.close();
} finally {
  await browser.close();
}
