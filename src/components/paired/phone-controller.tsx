"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, Camera, Check, ChevronRight, Columns2, Images, LoaderCircle, LockKeyhole, Mic, Pencil, Ruler, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { getAnonymousAccessToken, getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { productFeatures } from "@/lib/config/features";
import { normalizeRoomPhoto } from "@/lib/session/photo";
import { pairedCanonicalStateSchema, refinementInterpretationSchema, sessionJoinEnvelopeSchema, type PairedCanonicalState, type SessionJoinEnvelope, type StudioCommand } from "@/lib/session/schema";
import { createSessionTransport, type SessionTransport } from "@/lib/session/transport";
import { spaceAnalysisEnvelopeSchema, type SpaceAnalysisEnvelope } from "@/lib/studio/analysis";
import { parseStudioRefinement } from "@/lib/studio/refinement";
import { spatialAssetVariants } from "@/lib/spatial/assets";
import { VoiceGuide } from "./voice-guide";

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
  const [photo, setPhoto] = useState<{ file: File; width: number; height: number; preview: string; source: "demo" | "camera" | "gallery" } | null>(null);
  const [dimensions, setDimensions] = useState({ widthM: "5.2", depthM: "4.0", heightM: "2.7" });
  const [editingDimensions, setEditingDimensions] = useState(false);
  const [analysis, setAnalysis] = useState<SpaceAnalysisEnvelope | null>(null);
  const [retained, setRetained] = useState<string[]>([]);
  const [brief, setBrief] = useState(emptyBrief);
  const [listening, setListening] = useState<BriefField | "refinement" | null>(null);
  const [typing, setTyping] = useState(false);
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

  async function choosePhoto(file?: File, source: "demo" | "camera" | "gallery" = "gallery") {
    if (!file) return;
    setBusy("Normalizing photo…"); setError("");
    try {
      const normalized = await normalizeRoomPhoto(file);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = URL.createObjectURL(normalized.file);
      setPhoto({ ...normalized, preview: previewRef.current, source });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Photo could not be normalized."); }
    finally { setBusy(""); }
  }

  async function loadDemoRoom() {
    setBusy("Preparing demo room…"); setError("");
    try {
      const response = await fetch("/demo/livingroom.jpg");
      if (!response.ok) throw new Error("The demo room is unavailable. Capture or choose a room instead.");
      const blob = await response.blob();
      await choosePhoto(new File([blob], "interiorin-demo-living-room.jpg", { type: "image/jpeg" }), "demo");
      setDimensions({ widthM: "5.2", depthM: "4.0", heightM: "2.7" });
      setEditingDimensions(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The demo room could not be prepared."); }
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

  async function requestRefinement(requestedTranscript = refinement) {
    const option = state.options.find((candidate) => candidate.id === state.selectedOptionId);
    if (!option || requestedTranscript.trim().length < 2) { const message = "Type or speak one change for the selected room."; setError(message); return message; }
    setRefinement(requestedTranscript);
    setBusy("Checking proposed change…"); setError("");
    try {
      const parsed = parseStudioRefinement(option.scene, requestedTranscript);
      let interpretation;
      if (parsed.status === "ready") {
        interpretation = refinementInterpretationSchema.parse({ mode: "local_parser", action: parsed.action, summary: parsed.summary, disclosure: "Deterministic local parser; no provider request was needed.", latencyMs: 0 });
      } else {
        const response = await fetch("/api/refine", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
          transcript: requestedTranscript, fallbackQuestion: parsed.question,
          context: {
            objects: option.scene.objects.map((object) => ({ id: object.id, label: object.label, category: object.category, assetId: object.assetId, protected: object.protected, position: object.transform.position, rotationY: object.transform.rotation.y, allowedAssetIds: spatialAssetVariants.filter((variant) => variant.category === object.category).map((variant) => variant.id) })),
            zones: option.scene.zones.map((zone) => ({ id: zone.id, label: zone.label, kind: zone.kind, protected: zone.protected, materialId: zone.materialId })),
          },
        }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Refinement provider failed.");
        interpretation = refinementInterpretationSchema.parse({ mode: body.mode, action: body.action, summary: body.summary, clarification: body.clarification, model: body.model, responseId: body.responseId, disclosure: body.disclosure, latencyMs: body.latencyMs });
      }
      const next = await send({ type: "request_refinement", transcript: requestedTranscript, interpretation });
      const proposal = next.proposals.at(-1);
      return proposal?.receipt?.status === "accepted"
        ? `Interiorin checks passed. The proposal is visible and still requires the homeowner's approval.`
        : proposal?.interpretation.clarification ?? proposal?.receipt?.message ?? "The request was checked and is visible on the phone.";
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Refinement could not be checked."; setError(message); return message; }
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

  async function requestVisualReveal() {
    if (join?.mode !== "supabase") { setError("Live Nano Banana Reveal requires verified real-device pairing. Canonical 3D remains available in same-device mode."); return; }
    setBusy("Generating visual reveal…"); setError("");
    try {
      await send({ type: "request_visual_reveal" });
      const snapshot = await transportRef.current!.recover();
      const accessToken = await getAnonymousAccessToken();
      if (!accessToken) throw new Error("Controller authentication expired. Reconnect the phone and retry.");
      const response = await fetch(`/api/sessions/${sessionId}/visual-reveal`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ expectedRevision: snapshot.revision, idempotencyKey: crypto.randomUUID() }) });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Visual Reveal could not be generated.");
      const recovered = await transportRef.current!.recover();
      setState(pairedCanonicalStateSchema.parse(recovered.canonicalState));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Visual Reveal could not be generated. Canonical 3D remains available."); }
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

  async function selectReviewVersion(versionId: string) {
    setBusy("Selecting architect review version…"); setError("");
    try { await send({ type: "select_review_version", versionId }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Review version could not be selected."); }
    finally { setBusy(""); }
  }

  async function endSession() {
    if (!window.confirm("End this session and delete its stored room source and canonical state?")) return;
    setBusy("Deleting session…"); setError("");
    try {
      const ended = await send({ type: "end_session" });
      await transportRef.current?.deleteSession();
      setState({ ...ended, stage: "ended" });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Session could not be deleted."); }
    finally { setBusy(""); }
  }

  if (status === "joining") return <PhoneStatus icon={<LoaderCircle className="spin" />} title="Pairing securely…" detail="Authenticating this phone and claiming the one-time controller seat." />;
  if (status === "error") return <PhoneStatus icon={<LockKeyhole />} title="This phone could not join." detail={error} error />;
  if (state.stage === "ended") return <PhoneStatus icon={<Check />} title="Session deleted." detail="The room source and canonical session state are no longer available from this controller." />;
  const currentStage = state.stage === "space" ? "Space" : state.stage === "brief" ? "Intent" : state.selectedReviewVersionId ? "Finish" : "Design";
  const currentProposal = state.proposals.at(-1);

  return <main className="phone-shell" id="main-content">
    <header className="phone-header"><div><p className="eyebrow">Interiorin controller</p><strong>{currentStage}</strong></div><span className="phone-connection"><Check aria-hidden="true" /> Paired</span><button type="button" className="phone-end-session" onClick={() => void endSession()} disabled={Boolean(busy)} aria-label="End and delete session"><Trash2 aria-hidden="true" /></button></header>
    <div className="phone-progress" aria-label="Journey progress">{["Space", "Intent", "Design", "Finish"].map((label) => <span key={label} className={label === currentStage ? "is-current" : ""}>{label}</span>)}</div>
    {state.stage === "space" ? <section className="phone-stage" aria-labelledby="phone-title">
      <p className="eyebrow">Step 1 of 4 · Space</p><h1 id="phone-title">Show us the room. You keep control of the facts.</h1>
      <p>The photo identifies visible cues. Only the dimensions you enter become metric authority.</p>
      <div className="phone-source-choices" aria-label="Choose a room source">
        <button type="button" className="phone-action" onClick={() => void loadDemoRoom()} disabled={Boolean(busy)}><Sparkles aria-hidden="true" /><span><strong>Use demo room</strong><small>Fast path · editable estimated dimensions</small></span><ChevronRight aria-hidden="true" /></button>
        <label className="phone-action phone-file"><Camera aria-hidden="true" /><span><strong>Capture a room</strong><small>Open the rear camera</small></span><ChevronRight aria-hidden="true" /><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" onChange={(event) => void choosePhoto(event.target.files?.[0], "camera")} /></label>
        <label className="phone-action phone-file"><Images aria-hidden="true" /><span><strong>Choose from gallery</strong><small>JPEG, PNG, or WebP · normalized privately</small></span><ChevronRight aria-hidden="true" /><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => void choosePhoto(event.target.files?.[0], "gallery")} /></label>
      </div>
      {photo ? <div className="phone-photo"><Image src={photo.preview} alt={photo.source === "demo" ? "Interiorin demo living room preview" : "Normalized room source preview"} width={photo.width} height={photo.height} unoptimized /><span>{photo.source === "demo" ? "Demo room" : "Private normalized source"} · {photo.width} × {photo.height}px · {(photo.file.size / 1024 / 1024).toFixed(1)} MB · EXIF removed</span></div> : null}
      <div className="phone-dimension-summary">
        <div><Ruler aria-hidden="true" /><span><strong>{photo?.source === "demo" ? "Demo estimate · not measured" : "Declared room dimensions"}</strong><small>{dimensions.widthM} × {dimensions.depthM} × {dimensions.heightM} m</small></span></div>
        <button type="button" onClick={() => setEditingDimensions((current) => !current)} aria-expanded={editingDimensions} aria-controls="room-dimensions"><Pencil aria-hidden="true" /> {editingDimensions ? "Done" : "Edit measurements"}</button>
      </div>
      {editingDimensions ? <fieldset id="room-dimensions" className="phone-dimensions"><legend><Ruler aria-hidden="true" /> Measurements you declare</legend>{(["widthM", "depthM", "heightM"] as const).map((field) => <label key={field}>{field === "widthM" ? "Width" : field === "depthM" ? "Depth" : "Height"}<input type="number" min="2" max={field === "heightM" ? "8" : "40"} step="0.1" inputMode="decimal" value={dimensions[field]} onChange={(event) => setDimensions({ ...dimensions, [field]: event.target.value })} /><span>m</span></label>)}</fieldset> : null}
      <button className="paired-primary phone-continue" onClick={submitSpace} disabled={Boolean(busy) || !photo}>{busy ? <LoaderCircle className="spin" /> : <ChevronRight />} {busy || "Use this room"}</button>
      <Disclosure join={join} />{error ? <p className="paired-error" role="alert">{error}</p> : null}
    </section> : null}
    {state.stage === "brief" ? <section className="phone-stage" aria-labelledby="brief-title">
      <p className="eyebrow">Step 2 of 4 · Intent</p><h1 id="brief-title">Tell us how life should feel here.</h1>
      <p>{analysis?.disclosure ?? "Visual analysis is optional. Entered dimensions remain the sole metric authority."}</p>
      {productFeatures.voiceGuide ? <VoiceGuide sessionId={sessionId} stage="intent" typing={typing} summary={`Purpose: ${brief.purpose || "not entered"}. Feeling: ${brief.feeling || "not entered"}. Must keep: ${brief.mustKeep || "not entered"}. Improve or avoid: ${brief.improveOrAvoid || "not entered"}.`} onBrief={setBrief} onRefinement={requestRefinement} onTypeInstead={() => document.getElementById("brief-purpose")?.focus()} /> : null}
      {analysis?.analysis?.retainedObjects.length ? <fieldset className="retained-list"><legend>Confirm what must remain</legend>{analysis.analysis.retainedObjects.map((object, index) => { const id = `retained-${index}`; return <label key={id}><input type="checkbox" checked={retained.includes(id)} onChange={(event) => setRetained(event.target.checked ? [...retained, id] : retained.filter((item) => item !== id))} /><span><strong>{object.label}</strong><small>{object.category} · {object.confidence} confidence</small></span></label>; })}</fieldset> : <p className="phase-note">No retained objects were promoted from the photo. Add anything important in “What must remain?”</p>}
      {([ ["purpose", "What should this room support?"], ["feeling", "How should it feel?"], ["mustKeep", "What must remain?"], ["improveOrAvoid", "What should improve or be avoided?"] ] as const).map(([field, label]) => <div className="phone-question" key={field}><label>{label}<textarea id={`brief-${field}`} rows={3} required value={brief[field]} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} onChange={(event) => setBrief({ ...brief, [field]: event.target.value })} /></label><button type="button" onClick={() => dictate(field)} aria-label={`Push to talk for ${label}`}><Mic aria-hidden="true" /> {listening === field ? "Listening…" : "Push to talk"}</button></div>)}
      <button className="paired-primary phone-continue" onClick={submitBrief} disabled={Boolean(busy) || Object.values(brief).some((value) => value.trim().length < 3)}>{busy ? <LoaderCircle className="spin" /> : <ChevronRight />} {busy || "Confirm my brief"}</button>
      {error ? <p className="paired-error" role="alert">{error}</p> : null}
    </section> : null}
    {state.stage === "options" || state.stage === "refine" || state.stage === "approve" ? <section className="phone-stage" aria-labelledby="options-title">
      <p className="eyebrow">Step 3 of 4 · Design</p><h1 id="options-title">{state.stage === "options" ? "Choose the direction worth refining." : state.stage === "approve" ? "Approve only the checked action." : "Say what should change."}</h1><p>{state.stage === "options" ? "The wall owns the live 3D canvas. These cards carry the same canonical scenes and material decisions." : "AI may interpret intent. Interiorin validates identifiers, protection, envelope, overlap, and clearance before any mutation."}</p>
      <div className="phone-options">{state.options.filter((option) => state.stage === "options" || option.id === state.selectedOptionId).map((option) => <button key={option.id} onClick={() => void selectOption(option.id)} aria-pressed={state.selectedOptionId === option.id}><span className="phone-swatches" aria-hidden="true"><i /><i /><i /></span><span><small>{option.principle}</small><strong>{option.name}</strong><em>{option.rationale}</em></span><ChevronRight /></button>)}</div>
      {state.stage !== "options" && productFeatures.visualReveal ? <section className="phone-reveal-request" aria-labelledby="phone-reveal-title"><div><p className="eyebrow">Nano Banana Reveal</p><h2 id="phone-reveal-title">See the checked direction in the room photo.</h2><p>Presentation only. The wall keeps canonical 3D and spatial checks authoritative.</p></div><button type="button" onClick={() => void requestVisualReveal()} disabled={Boolean(busy) || join?.mode !== "supabase"}><Sparkles aria-hidden="true" />{busy === "Generating visual reveal…" ? busy : state.visualReveal?.status === "generated" || state.visualReveal?.status === "stale" ? "Refresh room reveal" : "Visualize this direction in my room"}</button>{join?.mode !== "supabase" ? <small>Available after verified real-device pairing; same-device demo keeps the checked 3D flow.</small> : state.visualReveal ? <small data-status={state.visualReveal.status}>{state.visualReveal.status === "stale" ? "Earlier revision · 3D has changed" : state.visualReveal.status === "failed" ? state.visualReveal.failure : state.visualReveal.status === "generated" ? "Current reveal is visible on the wall" : "Generating visual reveal"}</small> : null}</section> : null}
      {state.stage !== "options" && productFeatures.voiceGuide ? <VoiceGuide sessionId={sessionId} stage="design" typing={typing} summary={`Selected direction: ${state.options.find((option) => option.id === state.selectedOptionId)?.name ?? "none"}. Saved versions: ${state.versions.length}. Latest proposal: ${currentProposal?.status ?? "none"}.`} onBrief={setBrief} onRefinement={requestRefinement} onTypeInstead={() => document.getElementById("refinement-request")?.focus()} /> : null}
      {state.stage !== "options" ? <div className="phone-refine"><label>Refinement request<textarea id="refinement-request" rows={3} value={refinement} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} onChange={(event) => setRefinement(event.target.value)} placeholder="Move the table right 30 cm" /></label><div><button type="button" onClick={dictateRefinement}><Mic />{listening === "refinement" ? "Listening…" : "Push to talk"}</button><button type="button" onClick={() => void requestRefinement()} disabled={Boolean(busy)}>{busy || "Check this change"}<ChevronRight /></button></div></div> : null}
      {currentProposal ? <article className="phone-proposal" data-status={currentProposal.status}><p className="eyebrow">{currentProposal.interpretation.mode.replaceAll("_", " ")} · {currentProposal.interpretation.latencyMs} ms</p><h2>{currentProposal.interpretation.summary ?? currentProposal.interpretation.clarification}</h2>{currentProposal.receipt ? <><p><strong>{currentProposal.receipt.status === "accepted" ? "Deterministic checks passed" : "Change rejected"}</strong>{currentProposal.receipt.message}</p>{currentProposal.receipt.warnings.map((warning) => <small key={warning}>{warning}</small>)}</> : null}<p>{currentProposal.interpretation.disclosure}</p>{currentProposal.status === "awaiting_approval" ? <div><button onClick={() => void decideProposal(currentProposal.id, false)}>Reject</button><button onClick={() => void decideProposal(currentProposal.id, true)} disabled={Boolean(busy)}>Approve checked action</button></div> : <strong className="proposal-status">{currentProposal.status.replaceAll("_", " ")}</strong>}</article> : null}
      {error ? <p className="paired-error" role="alert">{error}</p> : null}
    </section> : null}
    {state.stage === "refine" || state.stage === "approve" ? <><VersionLedger state={state} versionName={versionName} setVersionName={setVersionName} comparison={comparison} setComparison={setComparison} busy={Boolean(busy)} onSave={saveVersion} onCompare={showComparison} /><ReviewSelection state={state} busy={Boolean(busy)} onSelect={selectReviewVersion} /></> : null}
  </main>;
}

function VersionLedger({ state, versionName, setVersionName, comparison, setComparison, busy, onSave, onCompare }: { state: PairedCanonicalState; versionName: string; setVersionName: (value: string) => void; comparison: { firstVersionId: string; secondVersionId: string }; setComparison: (value: { firstVersionId: string; secondVersionId: string }) => void; busy: boolean; onSave: () => Promise<void>; onCompare: () => Promise<void> }) {
  return <section className="phone-versions" aria-labelledby="versions-title"><p className="eyebrow">Version ledger · {state.versions.length}/12</p><h2 id="versions-title">Save the room, then compare honestly.</h2><div className="phone-version-save"><label>Version name<input maxLength={40} value={versionName} onChange={(event) => setVersionName(event.target.value)} /></label><button type="button" onClick={() => void onSave()} disabled={busy || state.versions.length >= 12}><BookmarkPlus aria-hidden="true" /> Save version</button></div>{state.versions.length ? <ol>{state.versions.map((version) => <li key={version.id}><span><strong>{version.name}</strong><small>{new Date(version.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · canonical scene</small></span><Check aria-label="Saved" /></li>)}</ol> : <p className="phase-note">Save before and after a checked change to create an exact comparison.</p>}{state.versions.length >= 2 ? <div className="phone-compare-controls"><label>First version<select value={comparison.firstVersionId} onChange={(event) => setComparison({ ...comparison, firstVersionId: event.target.value })}><option value="">Choose version</option>{state.versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label><label>Second version<select value={comparison.secondVersionId} onChange={(event) => setComparison({ ...comparison, secondVersionId: event.target.value })}><option value="">Choose version</option>{state.versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label><button type="button" onClick={() => void onCompare()} disabled={busy}><Columns2 aria-hidden="true" /> Compare on wall</button></div> : null}</section>;
}

function ReviewSelection({ state, busy, onSelect }: { state: PairedCanonicalState; busy: boolean; onSelect: (versionId: string) => Promise<void> }) {
  if (!state.versions.length) return null;
  return <section className="phone-review-select" aria-labelledby="review-select-title"><p className="eyebrow">Architect concept review</p><h2 id="review-select-title">Choose the direction to hand off.</h2><p>One saved canonical version becomes the review sheet and structured JSON source.</p><div>{state.versions.map((version) => <button type="button" key={version.id} aria-pressed={state.selectedReviewVersionId === version.id} disabled={busy} onClick={() => void onSelect(version.id)}><span><strong>{version.name}</strong><small>{state.selectedReviewVersionId === version.id ? "Selected for review" : "Select this saved scene"}</small></span>{state.selectedReviewVersionId === version.id ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}</button>)}</div></section>;
}

function Disclosure({ join }: { join: SessionJoinEnvelope | null }) { return <p className="paired-notice"><ShieldCheck aria-hidden="true" /> {join?.disclosure}</p>; }
function PhoneStatus({ icon, title, detail, error = false }: { icon: React.ReactNode; title: string; detail: string; error?: boolean }) { return <main className={`phone-status ${error ? "phone-status--error" : ""}`}><div aria-hidden="true">{icon}</div><p className="eyebrow">Interiorin controller</p><h1>{title}</h1><p role={error ? "alert" : undefined}>{detail}</p>{error ? <Link className="paired-text-link" href="/wall">Return to Studio Wall</Link> : null}</main>; }
