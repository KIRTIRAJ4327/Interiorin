const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();
if (!apiKey || !agentId) throw new Error("ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID are required.");

const base = "https://api.elevenlabs.io/v1/convai";
const headers = { "content-type": "application/json", "xi-api-key": apiKey };

async function eleven(path, init = {}) {
  const response = await fetch(`${base}${path}`, { ...init, headers: { ...headers, ...init.headers }, signal: AbortSignal.timeout(15_000) });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail?.[0]?.msg ?? body?.detail ?? body?.message ?? "request failed";
    throw new Error(`ElevenLabs ${response.status}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
  }
  return body;
}

const clientTools = [
  {
    name: "record_design_brief",
    description: "Record the homeowner's four-part brief only after all four values are known. The phone displays the result for editing and explicit confirmation.",
    parameters: {
      type: "object",
      required: ["purpose", "feeling", "mustKeep", "improveOrAvoid"],
      properties: {
        purpose: { type: "string", description: "What the room should help the homeowner do." },
        feeling: { type: "string", description: "How the room should feel." },
        mustKeep: { type: "string", description: "Objects, features, or access that must remain." },
        improveOrAvoid: { type: "string", description: "What should improve and what should be avoided." },
      },
    },
  },
  {
    name: "submit_refinement",
    description: "Submit exactly one finalized spoken room change for Interiorin's deterministic checks. This never approves or commits the change.",
    parameters: { type: "object", required: ["transcript"], properties: { transcript: { type: "string", description: "The user's final, concise refinement request." } } },
  },
  {
    name: "read_design_summary",
    description: "Read the current display-safe Interiorin design summary. Use it for a concise recap; never invent scene facts.",
    parameters: { type: "object", required: [], properties: {} },
  },
];

async function ensureClientTool(spec) {
  const listed = await eleven(`/tools?search=${encodeURIComponent(spec.name)}&types=client&page_size=20`, { method: "GET" });
  const existing = listed.tools?.find((tool) => tool.tool_config?.name === spec.name);
  if (existing) return existing.id;
  const created = await eleven("/tools", {
    method: "POST",
    body: JSON.stringify({ tool_config: { type: "client", name: spec.name, description: spec.description, expects_response: true, response_timeout_secs: 20, parameters: spec.parameters } }),
  });
  return created.id;
}

const toolIds = await Promise.all(clientTools.map(ensureClientTool));
const prompt = `You are Interiorin's optional voice guide for a paired phone-and-laptop living-room design session.

Your job is narrow: gather intent concisely, submit one finalized refinement at a time, and recap display-safe facts. Interiorin—not you—owns geometry, spatial checks, versions, approval, and commits.

INTAKE
- Start with one useful question: "What should this room help you do, how should it feel, and is there anything we must keep or avoid?"
- Extract purpose, feeling, mustKeep, and improveOrAvoid. Ask at most one brief follow-up only when a required value is genuinely missing.
- Call record_design_brief once all four values are known. Tell the homeowner to review the editable phone fields and tap Confirm my brief.

REFINEMENT
- Accept exactly one room change at a time. Use only the user's finalized words in submit_refinement.
- After the tool responds, summarize its checked result in one sentence. Always say the homeowner must tap Approve checked action before anything changes.

BEHAVIOR
- Normally speak one sentence and stay under about 12 seconds.
- No filler, praise, repeated visible instructions, wait narration, hidden reasoning, or fabricated measurements.
- Never claim the photo measured geometry. Never approve, reject, mutate, save, export, delete, or generate an image.
- If the user asks for time, call skip_turn and remain silent.
- Allow interruption. If the user types, stop speaking and let the phone UI lead.
- Use read_design_summary for recaps; never invent unavailable scene facts.`;

const updated = await eleven(`/agents/${encodeURIComponent(agentId)}`, {
  method: "PATCH",
  body: JSON.stringify({
    version_description: "Interiorin locked concise authenticated voice flow",
    platform_settings: {
      auth: { enable_auth: true },
      privacy: { record_voice: false, retention_days: 0, delete_transcript_and_pii: true, delete_audio: true, apply_to_existing_conversations: false },
    },
    conversation_config: {
      turn: { turn_timeout: 12, turn_eagerness: "patient" },
      agent: { first_message: "Tell me what this room should help you do, how it should feel, and anything we must keep or avoid.", prompt: { prompt, tool_ids: toolIds, built_in_tools: { skip_turn: { name: "skip_turn", description: "Remain silent when the homeowner asks for time to think." } } } },
    },
  }),
});

console.log(JSON.stringify({ agent: updated.name, authRequired: updated.platform_settings?.auth?.enable_auth, turnEagerness: updated.conversation_config?.turn?.turn_eagerness, turnTimeout: updated.conversation_config?.turn?.turn_timeout, toolCount: updated.conversation_config?.agent?.prompt?.tool_ids?.length ?? 0 }, null, 2));
