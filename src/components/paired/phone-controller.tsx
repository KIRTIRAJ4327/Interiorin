"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, Camera, Check, ChevronRight, Columns2, LoaderCircle, LockKeyhole, Mic, Ruler, ShieldCheck } from "lucide-react";
import { getAnonymousAccessToken, getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { normalizeRoomPhoto } from "@/lib/session/photo";
import { pairedCanonicalStateSchema, refinementInterpretationSchema, sessionJoinEnvelopeSchema, type PairedCanonicalState, type SessionJoinEnvelope, type StudioCommand } from "@/lib/session/schema";
import { createSessionTransport, type SessionTransport } from "@/lib/session/transport";
import { spaceAnalysisEnvelopeSchema, type SpaceAnalysisEnvelope } from "@/lib/studio/analysis";
import { parseStudioRefinement } from "@/lib/studio/refinement";
import { spatialAssetVariants } from "@/lib/spatial/assets";

const emptyBrief = { purpose: "", feeling: "", mustKeep: "", improveOrAvoid: "" };
type BriefField = keyof typeof emptyBrief;
type BrowserSpeechRecognition = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
type StudioCommandDraft = StudioCommand extends infer Command
  ? Command extends StudioCommand ? Omit<Command, "idempotencyKey" | "expectedRevision" | "clientTimestamp"> : never
  : never;

export function PhoneController({ sessionId, token, requestedMode }: { sessionId: string; token: string; requestedMode?: string }) {
  const [join, setJoin] = useState<SessionJoinEnvelope | null>(null);
  const [status, setStatus] = useState<"joining" | "connected" | "error">("joining");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [state, setState] = useState<PairedCanonicalState>(() => pairedCanonicalStateSchema.parse({}));
  const [photo, setPhoto] = useState<{ file: File; width: number; height: number; preview: string } | null>(null);
  const [dimensions, setDimensions] = useState({ widthM: "5.2", depthM: "4.0", heightM: "2.7" });
  const [analysis, setAnalysis] = useState<SpaceAnalysisEnvelope | null>(null);
  const [retained, setRetained] = useState<string[]>([]);
  const [brief, setBrief] = useState(emptyBrief);
  const [listening, setListening] = useState<BriefField | "refinement" | null>(null);
  const [refinement, setRefinement] = useState("");
  const [versionName, setVersionName] = useState("Direction A");
  const [comparison, setComparison] = useState({ firstVersionId: "", secondVersionId: "" });
  const transportRef = useRef<SessionTransport | null>(null);
  const previewRef = useRef("");

  useEffect(() => {
    let mounted = true;
    let transport: SessionTransport | null = null;
    async function pair() {
      try {
        const storedMode = localStorage.getItem(`interiorin:mode:${sessionId}`) as "supabase" | "same_device" | null;
        let paired: SessionJoinEnvelope;
        if (!token && storedMode && localStorage.getItem(`interiorin:joined:${sessionId}`)) {
          paired = { mode: storedMode, sessionId, role: "controller", disclosure: storedMode === "same_device" ? "Same-device demo mode: data remains in this browser origin." : "Private paired session reconnected." };
        } else {
          const accessToken = requestedMode === "same_device" ? null : await getAnonymousAccessToken();
          const response = await fetch(`/api/sessions/${sessionId}/join`, { method: "POST", headers: { "content-type": "application/json", ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify({ token }) });
          const body: unknown = await response.json();
          if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Pairing failed.");
          paired = sessionJoinEnvelopeSchema.parse(body);
        }
        if (!mounted) return;
        setJoin(paired);
        localStorage.setItem(`interiorin:mode:${sessionId}`, paired.mode);
        localStorage.setItem(`interiorin:joined:${sessionId}`, "true");
        window.history.replaceState({}, "", `/control/${sessionId}`);
        transport = createSessionTransport(paired.mode, sessionId, "controller");
        transportRef.current = transport;
        await transport.connect();
        const snapshot = await transport.recover();
        if (mounted) { setState(pairedCanonicalStateSchema.parse(snapshot.canonicalState)); setStatus("connected"); }
      } catch (cause) {
        if (mounted) { setStatus("error"); setError(cause instanceof Error ? cause.message : "Pairing failed."); }
      }
    }
    void pair();
    return () => { mounted = false; transportRef.current = null; if (transport) void transport.dispose(); if (previewRef.current) URL.revokeObjectURL(previewRef.current); };
  }, [requestedMode, sessionId, token]);

  async function send(command: StudioCommandDraft) {
    const transport = transportRef.current;
    if (!transport) throw new Error("Controller transport is not connected.");
    const snapshot = await transport.recover();
    await transport.sendCommand({ ...command, idempotencyKey: crypto.randomUUID(), expectedRevision: snapshot.revision, clientTimestamp: new Date().toISOString() } as StudioCommand);
    const recovered = await transport.recover();
    const next = pairedCanonicalStateSchema.parse(recovered.canonicalState);
    setState(next);
    return next;
  }

  async function choosePhoto(file?: File) {
    if (!file) return;
    setBusy("Normalizing photo…"); setError("");
    try {
      const normalized = await normalizeRoomPhoto(file);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = URL.createObjectURL(normalized.file);
      setPhoto({ ...normalized, preview: previewRef.current });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Photo could not be normalized."); }
    finally { setBusy(""); }
  }

  async function submitSpace() {
    if (!photo) { setError("Capture or choose one room photo."); return; }
    setBusy("Securing room source…"); setError("");
    try {
      const mode = join?.mode ?? "same_device";
      let objectPath = `local/${sessionId}/${crypto.randomUUID()}.jpg`;
      if (mode === "supabase") {
        const client = getSupabaseBrowserClient();
        if (!client) throw new Error("Private storage is unavailable.");
        objectPath = `${sessionId}/${crypto.randomUUID()}.jpg`;
        const uploaded = await client.storage.from("studio-sources").upload(objectPath, photo.file, { contentType: "image/jpeg", upsert: false });
        if (uploaded.error) throw uploaded.error;
      }
      await send({ type: "submit_source", sourceObjectPath: objectPath, fileName: photo.file.name, mimeType: "image/jpeg", byteSize: photo.file.size, pixelWidth: photo.width, pixelHeight: photo.height, dimensions: { widthM: Number(dimensions.widthM), depthM: Number(dimensions.depthM), heightM: Number(dimensions.heightM) } });
      const body = new FormData(); body.set("source", photo.file); body.set("kind", "interior"); body.set("condition", "existing"); body.set("intent", "Create a useful, comfortable interior from the guided homeowner brief.");
      const response = await fetch("/api/space-analysis", { method: "POST", body });
      const envelope = spaceAnalysisEnvelopeSchema.parse(await response.json());
      setAnalysis(envelope);
      setRetained((envelope.analysis?.retainedObjects ?? []).map((_, index) => `retained-${index}`));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Room source could not be submitted."); }
    finally { setBusy(""); }
  }

  async function submitBrief() {
    setBusy("Building three checked directions…"); setError("");
    try {
      await send({ type: "confirm_analysis", analysis: analysis?.analysis, disclosure: analysis?.disclosure ?? "Visual analysis unavailable; entered dimensions remain usable.", acceptedRetainedObjectIds: retained });
      await send({ type: "submit_brief", answers: brief });
      await send({ type: "generate_options" });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Options could not be generated."); }
    finally { setBusy(""); }
  }

  function dictate(field: BriefField) {
    const speechWindow = window as typeof window & { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) { setError("Voice input is unavailable here. Type your answer instead."); return; }
    const recognition = new Recognition();
    recognition.lang = "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    setListening(field); setError("");
    recognition.onresult = (event) => setBrief((current) => ({ ...current, [field]: event.results[0]?.[0]?.transcript?.trim() ?? current[field] }));
    recognition.onerror = () => setError("Microphone access was denied or unavailable. Type your answer instead.");
    recognition.onend = () => setListening(null);
    recognition.start();
  }

  function dictateRefinement() {
    const speechWindow = window as typeof window & { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) { setError("Voice input is unavailable here. Type your refinement instead."); return; }
    const recognition = new Recognition(); recognition.lang = "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    setListening("refinement"); setError("");
    recognition.onresult = (event) => setRefinement(event.results[0]?.[0]?.transcript?.trim() ?? "");
    recognition.onerror = () => setError("Microphone access was denied or unavailable. Type your refinement instead.");
    recognition.onend = () => setListening(null); recognition.start();
  }

  async function requestRefinement() {
    const option = state.options.find((candidate) => candidate.id === state.selectedOptionId);
    if (!option || refinement.trim().length < 2) { setError("Type or speak one change for the selected room."); return; }
    setBusy("Checking proposed change…"); setError("");
    try {
      const parsed = parseStudioRefinement(option.scene, refinement);
      let interpretation;
      if (parsed.status === "ready") {
        interpretation = refinementInterpretationSchema.parse({ mode: "local_parser", action: parsed.action, summary: parsed.summary, disclosure: "Deterministic local parser; no provider request was needed.", latencyMs: 0 });
      } else {
        const response = await fetch("/api/refine", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
          transcript: refinement, fallbackQuestion: parsed.question,
          context: {
            objects: option.scene.objects.map((object) => ({ id: object.id, label: object.label, category: object.category, assetId: object.assetId, protected: object.protected, position: object.transform.position, rotationY: object.transform.rotation.y, allowedAssetIds: spatialAssetVariants.filter((variant) => variant.category === object.category).map((variant) => variant.id) })),
            zones: option.scene.zones.map((zone) => ({ id: zone.id, label: zone.label, kind: zone.kind, protected: zone.protected, materialId: zone.materialId })),
          },
        }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Refinement provider failed.");
        interpretation = refinementInterpretationSchema.parse({ mode: body.mode, action: body.action, summary: body.summary, clarification: body.clarification, model: body.model, responseId: body.responseId, disclosure: body.disclosure, latencyMs: body.latencyMs });
      }
      await send({ type: "request_refinement", transcript: refinement, interpretation });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Refinement could not be checked."); }
    finally { setBusy(""); }
  }

  async function decideProposal(proposalId: string, approve: boolean) {
    setBusy(approve ? "Committing checked change…" : "Rejecting proposal…"); setError("");
    try { await send(approve ? { type: "confirm_proposal", proposalId } : { type: "reject_proposal", proposalId }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Proposal decision failed."); }
    finally { setBusy(""); }
  }

  async function selectOption(optionId: string) {
    setBusy("Selecting direction…"); setError("");
    try { await send({ type: "select_option", optionId }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Direction could not be selected."); }
    finally { setBusy(""); }
  }

  async function saveVersion() {
    const name = versionName.trim();
    if (!name) { setError("Name this version before saving it."); return; }
    setBusy("Saving canonical version…"); setError("");
    try {
      const next = await send({ type: "save_version", name });
      const saved = next.versions.at(-1);
      setVersionName(`Direction ${String.fromCharCode(65 + Math.min(next.versions.length, 25))}`);
      if (saved) setComparison((current) => ({ firstVersionId: current.firstVersionId || next.versions[0]?.id || saved.id, secondVersionId: saved.id }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Version could not be saved."); }
    finally { setBusy(""); }
  }

  async function showComparison() {
    if (!comparison.firstVersionId || !comparison.secondVersionId || comparison.firstVersionId === comparison.secondVersionId) { setError("Choose two different saved versions."); return; }
    setBusy("Opening comparison on wall…"); setError("");
    try { await send({ type: "select_comparison", ...comparison }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Comparison could not be opened."); }
    finally { setBusy(""); }
  }

  if (status === "joining") return <PhoneStatus icon={<LoaderCircle className="spin" />} title="Pairing securely…" detail="Authenticating this phone and claiming the one-time controller seat." />;
  if (status === "error") return <PhoneStatus icon={<LockKeyhole />} title="This phone could not join." detail={error} error />;
  const currentStage = state.stage === "space" ? "Space" : state.stage === "brief" ? "Brief" : state.stage === "options" ? "Options" : state.stage === "approve" ? "Approve" : "Refine";
  const currentProposal = state.proposals.at(-1);

  return <main className="phone-shell" id="main-content">
    <header className="phone-header"><div><p className="eyebrow">Interiorin controller</p><strong>{currentStage}</strong></div><span className="phone-connection"><Check aria-hidden="true" /> Paired</span></header>
    <div className="phone-progress" aria-label="Journey progress">{["Space", "Brief", "Options", "Refine", "Approve"].map((label) => <span key={label} className={label === currentStage ? "is-current" : ""}>{label}</span>)}</div>
    {state.stage === "space" ? <section className="phone-stage" aria-labelledby="phone-title">
      <p className="eyebrow">Step 1 of 5 · Space</p><h1 id="phone-title">Show us the room. You keep control of the facts.</h1>
      <p>The photo identifies visible cues. Only the dimensions you enter become metric authority.</p>
      <label className="phone-action phone-file"><Camera aria-hidden="true" /><span><strong>{photo ? "Replace room photo" : "Capture room photo"}</strong><small>Orientation-corrected JPEG · maximum 5 MB</small></span><ChevronRight aria-hidden="true" /><input type="file" accept="image/*" capture="environment" onChange={(event) => void choosePhoto(event.target.files?.[0])} /></label>
      {photo ? <div className="phone-photo"><Image src={photo.preview} alt="Normalized room source preview" width={photo.width} height={photo.height} unoptimized /><span>{photo.width} × {photo.height}px · {(photo.file.size / 1024 / 1024).toFixed(1)} MB · EXIF removed</span></div> : null}
      <fieldset className="phone-dimensions"><legend><Ruler aria-hidden="true" /> Declared room dimensions</legend>{(["widthM", "depthM", "heightM"] as const).map((field) => <label key={field}>{field === "widthM" ? "Width" : field === "depthM" ? "Depth" : "Height"}<input type="number" min="2" max={field === "heightM" ? "8" : "40"} step="0.1" inputMode="decimal" value={dimensions[field]} onChange={(event) => setDimensions({ ...dimensions, [field]: event.target.value })} /><span>m</span></label>)}</fieldset>
      <button className="paired-primary phone-continue" onClick={submitSpace} disabled={Boolean(busy)}>{busy ? <LoaderCircle className="spin" /> : <ChevronRight />} {busy || "Continue to brief"}</button>
      <Disclosure join={join} />{error ? <p className="paired-error" role="alert">{error}</p> : null}
    </section> : null}
    {state.stage === "brief" ? <section className="phone-stage" aria-labelledby="brief-title">
      <p className="eyebrow">Step 2 of 5 · Brief</p><h1 id="brief-title">Tell us how life should feel here.</h1>
      <p>{analysis?.disclosure ?? "Visual analysis is optional. Entered dimensions remain the sole metric authority."}</p>
      {analysis?.analysis?.retainedObjects.length ? <fieldset className="retained-list"><legend>Confirm what must remain</legend>{analysis.analysis.retainedObjects.map((object, index) => { const id = `retained-${index}`; return <label key={id}><input type="checkbox" checked={retained.includes(id)} onChange={(event) => setRetained(event.target.checked ? [...retained, id] : retained.filter((item) => item !== id))} /><span><strong>{object.label}</strong><small>{object.category} · {object.confidence} confidence</small></span></label>; })}</fieldset> : <p className="phase-note">No retained objects were promoted from the photo. Add anything important in “What must remain?”</p>}
      {([ ["purpose", "What should this room support?"], ["feeling", "How should it feel?"], ["mustKeep", "What must remain?"], ["improveOrAvoid", "What should improve or be avoided?"] ] as const).map(([field, label]) => <div className="phone-question" key={field}><label>{label}<textarea rows={3} required value={brief[field]} onChange={(event) => setBrief({ ...brief, [field]: event.target.value })} /></label><button type="button" onClick={() => dictate(field)} aria-label={`Push to talk for ${label}`}><Mic aria-hidden="true" /> {listening === field ? "Listening…" : "Push to talk"}</button></div>)}
      <button className="paired-primary phone-continue" onClick={submitBrief} disabled={Boolean(busy) || Object.values(brief).some((value) => value.trim().length < 3)}>{busy ? <LoaderCircle className="spin" /> : <ChevronRight />} {busy || "Generate three directions"}</button>
      {error ? <p className="paired-error" role="alert">{error}</p> : null}
    </section> : null}
    {state.stage === "options" || state.stage === "refine" || state.stage === "approve" ? <section className="phone-stage" aria-labelledby="options-title">
      <p className="eyebrow">{state.stage === "options" ? "Step 3 of 5 · Options" : state.stage === "approve" ? "Step 5 of 5 · Approve" : "Step 4 of 5 · Refine"}</p><h1 id="options-title">{state.stage === "options" ? "Choose the direction worth refining." : state.stage === "approve" ? "Approve only the checked action." : "Say what should change."}</h1><p>{state.stage === "options" ? "The wall owns the live 3D canvas. These cards carry the same canonical scenes and material decisions." : "AI may interpret intent. Interiorin validates identifiers, protection, envelope, overlap, and clearance before any mutation."}</p>
      <div className="phone-options">{state.options.filter((option) => state.stage === "options" || option.id === state.selectedOptionId).map((option) => <button key={option.id} onClick={() => void selectOption(option.id)} aria-pressed={state.selectedOptionId === option.id}><span className="phone-swatches" aria-hidden="true"><i /><i /><i /></span><span><small>{option.principle}</small><strong>{option.name}</strong><em>{option.rationale}</em></span><ChevronRight /></button>)}</div>
      {state.stage !== "options" ? <div className="phone-refine"><label>Refinement request<textarea rows={3} value={refinement} onChange={(event) => setRefinement(event.target.value)} placeholder="Move the table right 30 cm" /></label><div><button type="button" onClick={dictateRefinement}><Mic />{listening === "refinement" ? "Listening…" : "Push to talk"}</button><button type="button" onClick={requestRefinement} disabled={Boolean(busy)}>{busy || "Check proposed change"}<ChevronRight /></button></div></div> : null}
      {currentProposal ? <article className="phone-proposal" data-status={currentProposal.status}><p className="eyebrow">{currentProposal.interpretation.mode.replaceAll("_", " ")} · {currentProposal.interpretation.latencyMs} ms</p><h2>{currentProposal.interpretation.summary ?? currentProposal.interpretation.clarification}</h2>{currentProposal.receipt ? <><p><strong>{currentProposal.receipt.status === "accepted" ? "Deterministic checks passed" : "Change rejected"}</strong>{currentProposal.receipt.message}</p>{currentProposal.receipt.warnings.map((warning) => <small key={warning}>{warning}</small>)}</> : null}<p>{currentProposal.interpretation.disclosure}</p>{currentProposal.status === "awaiting_approval" ? <div><button onClick={() => void decideProposal(currentProposal.id, false)}>Reject</button><button onClick={() => void decideProposal(currentProposal.id, true)} disabled={Boolean(busy)}>Approve checked action</button></div> : <strong className="proposal-status">{currentProposal.status.replaceAll("_", " ")}</strong>}</article> : null}
      {error ? <p className="paired-error" role="alert">{error}</p> : null}
    </section> : null}
    {state.stage === "refine" || state.stage === "approve" ? <VersionLedger state={state} versionName={versionName} setVersionName={setVersionName} comparison={comparison} setComparison={setComparison} busy={Boolean(busy)} onSave={saveVersion} onCompare={showComparison} /> : null}
  </main>;
}

function VersionLedger({ state, versionName, setVersionName, comparison, setComparison, busy, onSave, onCompare }: { state: PairedCanonicalState; versionName: string; setVersionName: (value: string) => void; comparison: { firstVersionId: string; secondVersionId: string }; setComparison: (value: { firstVersionId: string; secondVersionId: string }) => void; busy: boolean; onSave: () => Promise<void>; onCompare: () => Promise<void> }) {
  return <section className="phone-versions" aria-labelledby="versions-title"><p className="eyebrow">Version ledger · {state.versions.length}/12</p><h2 id="versions-title">Save the room, then compare honestly.</h2><div className="phone-version-save"><label>Version name<input maxLength={40} value={versionName} onChange={(event) => setVersionName(event.target.value)} /></label><button type="button" onClick={() => void onSave()} disabled={busy || state.versions.length >= 12}><BookmarkPlus aria-hidden="true" /> Save version</button></div>{state.versions.length ? <ol>{state.versions.map((version) => <li key={version.id}><span><strong>{version.name}</strong><small>{new Date(version.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · canonical scene</small></span><Check aria-label="Saved" /></li>)}</ol> : <p className="phase-note">Save before and after a checked change to create an exact comparison.</p>}{state.versions.length >= 2 ? <div className="phone-compare-controls"><label>First version<select value={comparison.firstVersionId} onChange={(event) => setComparison({ ...comparison, firstVersionId: event.target.value })}><option value="">Choose version</option>{state.versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label><label>Second version<select value={comparison.secondVersionId} onChange={(event) => setComparison({ ...comparison, secondVersionId: event.target.value })}><option value="">Choose version</option>{state.versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label><button type="button" onClick={() => void onCompare()} disabled={busy}><Columns2 aria-hidden="true" /> Compare on wall</button></div> : null}</section>;
}

function Disclosure({ join }: { join: SessionJoinEnvelope | null }) { return <p className="paired-notice"><ShieldCheck aria-hidden="true" /> {join?.disclosure}</p>; }
function PhoneStatus({ icon, title, detail, error = false }: { icon: React.ReactNode; title: string; detail: string; error?: boolean }) { return <main className={`phone-status ${error ? "phone-status--error" : ""}`}><div aria-hidden="true">{icon}</div><p className="eyebrow">Interiorin controller</p><h1>{title}</h1><p role={error ? "alert" : undefined}>{detail}</p>{error ? <Link className="paired-text-link" href="/wall">Return to Studio Wall</Link> : null}</main>; }
