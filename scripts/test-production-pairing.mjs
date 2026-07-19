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

  await phoneContext.close();
  await wallContext.close();
} finally {
  await browser.close();
}
