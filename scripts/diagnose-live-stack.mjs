import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const envFile = process.argv[2] ?? ".env.vercel";
for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2];
  if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
  process.env[match[1]] = value;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const result = {
  urlConfigured: Boolean(url),
  publishableKeyConfigured: Boolean(publishableKey),
  secretKeyConfigured: Boolean(secretKey),
  anonymousAuth: false,
  secretKeyValid: false,
  schemaReady: false,
  sourceBucketReady: false,
  renderBucketReady: false,
  elevenLabsSignedUrl: false,
  nanoBananaModelVisible: false,
  openAiRefinement: false,
  errors: [],
};

let createdUserId;
try {
  if (!url || !publishableKey) throw new Error("Supabase browser configuration is incomplete.");
  const browser = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const signedIn = await browser.auth.signInAnonymously();
  if (signedIn.error || !signedIn.data.user) throw signedIn.error ?? new Error("Anonymous Auth returned no user.");
  createdUserId = signedIn.data.user.id;
  result.anonymousAuth = true;
} catch (error) {
  result.errors.push(`anonymousAuth: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  if (!url || !secretKey) throw new Error("Supabase server configuration is incomplete.");
  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const schema = await admin.from("studio_sessions").select("id", { count: "exact", head: true });
  if (schema.error) throw schema.error;
  result.secretKeyValid = true;
  result.schemaReady = true;
  const buckets = await admin.storage.listBuckets();
  if (buckets.error) throw buckets.error;
  result.sourceBucketReady = buckets.data.some((bucket) => bucket.id === "studio-sources" && bucket.public === false);
  result.renderBucketReady = buckets.data.some((bucket) => bucket.id === "studio-renders" && bucket.public === false);
  if (createdUserId) await admin.auth.admin.deleteUser(createdUserId);
} catch (error) {
  result.errors.push(`supabaseAdmin: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) throw new Error("ElevenLabs configuration is incomplete.");
  const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`, { headers: { "xi-api-key": apiKey } });
  const body = await response.json().catch(() => ({}));
  result.elevenLabsSignedUrl = response.ok && typeof body.signed_url === "string" && body.signed_url.startsWith("wss://");
  if (!result.elevenLabsSignedUrl) throw new Error(`signed URL request returned HTTP ${response.status}`);
} catch (error) {
  result.errors.push(`elevenLabs: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";
  if (!apiKey) throw new Error("Google image configuration is incomplete.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
  const body = await response.json().catch(() => ({}));
  result.nanoBananaModelVisible = response.ok && Array.isArray(body.models) && body.models.some((item) => item.name === `models/${model}`);
  if (!result.nanoBananaModelVisible) throw new Error(`model-list request returned HTTP ${response.status} without ${model}`);
} catch (error) {
  result.errors.push(`nanoBanana: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || model !== "gpt-5.6-terra" || process.env.ENABLE_LIVE_OPENAI !== "true") throw new Error("OpenAI live refinement configuration is incomplete or uses the wrong model.");
  const response = await new OpenAI({ apiKey }).responses.create({ model, store: false, input: "Reply with the single word ready.", max_output_tokens: 16 }, { signal: AbortSignal.timeout(10_000) });
  result.openAiRefinement = typeof response.id === "string" && response.id.startsWith("resp_");
  if (!result.openAiRefinement) throw new Error("OpenAI returned no response ID.");
} catch (error) {
  result.errors.push(`openAi: ${error instanceof Error ? error.message : String(error)}`);
}

console.log(JSON.stringify(result, null, 2));
if (!result.anonymousAuth || !result.secretKeyValid || !result.schemaReady) process.exitCode = 1;
