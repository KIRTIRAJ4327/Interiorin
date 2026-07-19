"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, CircleAlert, Download, Link2, Printer, Radio, ScanLine, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { pairedCanonicalStateSchema, type PairedCanonicalState, type SessionCreateEnvelope, type StudioEvent } from "@/lib/session/schema";
import { createSessionTransport, type SessionTransport } from "@/lib/session/transport";
import { StudioModel, type StudioModelHandle } from "@/components/product/studio-model";
import { compareScenes } from "@/lib/spatial/diff";
import { validateScene } from "@/lib/spatial/validation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PairedVersion = PairedCanonicalState["versions"][number];
const subscribeToStaticStorage = () => () => {};

export function WallSession({ sessionId }: { sessionId: string }) {
  const storedSession = useSyncExternalStore(
    subscribeToStaticStorage,
    () => sessionStorage.getItem(`interiorin:created:${sessionId}`) ?? "",
    () => "",
  );
  const storedMode = useSyncExternalStore(
    subscribeToStaticStorage,
    () => localStorage.getItem(`interiorin:mode:${sessionId}`) as "supabase" | "same_device" | null,
    () => null,
  );
  const session = useMemo(() => {
    if (!storedSession) return null;
    try { return JSON.parse(storedSession) as SessionCreateEnvelope; } catch { return null; }
  }, [storedSession]);
  const [connection, setConnection] = useState<"connecting" | "waiting" | "paired" | "error">("connecting");
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [message, setMessage] = useState("Opening the private session channel…");
  const [canonical, setCanonical] = useState<PairedCanonicalState>(() => pairedCanonicalStateSchema.parse({}));
  const [wallMode, setWallMode] = useState<"explore" | "model" | "reveal" | "compare" | "review">("explore");
  const [revealUrls, setRevealUrls] = useState<{ source?: string; reveal?: string }>({});
  const [snapshotUrls, setSnapshotUrls] = useState<Record<string, string>>({});
  const [captureFailures, setCaptureFailures] = useState<Set<string>>(() => new Set());
  const [captureVersionId, setCaptureVersionId] = useState("");
  const snapshotUrlsRef = useRef<Record<string, string>>({});
  const initialModeRecoveredRef = useRef(false);
  const transportRef = useRef<SessionTransport | null>(null);

  const mode = useMemo(() => session?.mode ?? storedMode ?? "same_device", [session, storedMode]);

  useEffect(() => {
    const transport = createSessionTransport(mode, sessionId, "wall");
    transportRef.current = transport;
    let mounted = true;
    async function recover() {
      const snapshot = await transport.recover().catch(() => null);
      if (!mounted || !snapshot) return;
      setEvents(snapshot.events);
      const nextCanonical = pairedCanonicalStateSchema.parse(snapshot.canonicalState);
      setCanonical(nextCanonical);
      if (!initialModeRecoveredRef.current) {
        initialModeRecoveredRef.current = true;
        if (nextCanonical.comparison) setWallMode("compare");
      }
      const latestEvent = snapshot.events.at(-1);
      if (latestEvent?.eventType === "review_version_selected") setWallMode("review");
      if (latestEvent?.eventType === "comparison_selected") setWallMode("compare");
      if (latestEvent?.eventType === "visual_reveal_generated") setWallMode("reveal");
      const paired = snapshot.members.some((member) => member.role === "controller");
      setConnection(paired ? "paired" : "waiting");
      setMessage(wallProgressMessage(nextCanonical, paired));
    }
    const unsubscribe = transport.subscribe((event) => {
      if (!mounted) return;
      setEvents((current) => [...current.filter((item) => item.id !== event.id), event].slice(-12));
      if (event.eventType === "session_ended") {
        setCanonical((current) => pairedCanonicalStateSchema.parse({ ...current, stage: "ended" }));
        return;
      }
      if (event.eventType === "controller_joined") {
        setConnection("paired");
        setMessage("Phone controller authenticated. The wall is ready for room intake.");
      }
      if (event.eventType === "review_version_selected") setWallMode("review");
      if (event.eventType === "comparison_selected") setWallMode("compare");
      if (event.eventType === "visual_reveal_generated") setWallMode("reveal");
      void recover();
    });
    void transport.connect().then(async () => {
      if (!mounted) return;
      await recover();
    }).catch((cause: unknown) => {
      if (!mounted) return;
      setConnection("error");
      setMessage(cause instanceof Error ? cause.message : "The session channel could not connect.");
    });
    const poll = mode === "supabase" ? window.setInterval(() => void recover(), 1800) : undefined;
    return () => { mounted = false; transportRef.current = null; if (poll) window.clearInterval(poll); unsubscribe(); void transport.dispose(); };
  }, [mode, sessionId]);

  const joined = connection === "paired";
  const selectedOption = canonical.options.find((option) => option.id === canonical.selectedOptionId) ?? canonical.options[0];
  const activeProposal = canonical.proposals.at(-1);
  const comparisonVersions = useMemo(() => canonical.comparison ? [canonical.versions.find((version) => version.id === canonical.comparison?.firstVersionId), canonical.versions.find((version) => version.id === canonical.comparison?.secondVersionId)].filter((version): version is PairedVersion => Boolean(version)) : [], [canonical.comparison, canonical.versions]);
  const reviewVersion = canonical.versions.find((version) => version.id === canonical.selectedReviewVersionId) ?? canonical.versions.at(-1);
  const snapshotCandidates = useMemo(() => [...comparisonVersions, ...(reviewVersion ? [reviewVersion] : [])].filter((version, index, versions) => versions.findIndex((candidate) => candidate.id === version.id) === index), [comparisonVersions, reviewVersion]);
  const captureVersion = canonical.versions.find((version) => version.id === captureVersionId);

  useEffect(() => {
    let active = true;
    const reveal = canonical.visualReveal;
    if (mode !== "supabase" || !canonical.source?.objectPath || !reveal?.objectPath || (reveal.status !== "generated" && reveal.status !== "stale")) {
      const reset = window.setTimeout(() => setRevealUrls({}), 0);
      return () => window.clearTimeout(reset);
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    void Promise.all([
      client.storage.from("studio-sources").createSignedUrl(canonical.source.objectPath, 3600),
      client.storage.from("studio-renders").createSignedUrl(reveal.objectPath, 3600),
    ]).then(([source, rendered]) => {
      if (active) setRevealUrls({ source: source.data?.signedUrl, reveal: rendered.data?.signedUrl });
    });
    return () => { active = false; };
  }, [canonical.source?.objectPath, canonical.visualReveal, mode]);

  useEffect(() => () => { Object.values(snapshotUrlsRef.current).forEach((url) => URL.revokeObjectURL(url)); }, []);
  useEffect(() => {
    if (captureVersionId) return;
    const next = snapshotCandidates.find((version) => !snapshotUrls[version.id] && !captureFailures.has(version.id));
    if (!next) return;
    const timer = window.setTimeout(() => setCaptureVersionId(next.id), 0);
    return () => window.clearTimeout(timer);
  }, [captureFailures, captureVersionId, snapshotCandidates, snapshotUrls]);

  function storeSnapshot(versionId: string, blob: Blob | null) {
    if (!blob) setCaptureFailures((current) => new Set(current).add(versionId));
    else {
      const nextUrl = URL.createObjectURL(blob);
      const prior = snapshotUrlsRef.current[versionId];
      if (prior) URL.revokeObjectURL(prior);
      snapshotUrlsRef.current = { ...snapshotUrlsRef.current, [versionId]: nextUrl };
      setSnapshotUrls(snapshotUrlsRef.current);
    }
    setCaptureVersionId("");
  }

  async function endSession() {
    if (!window.confirm("End this session and delete its stored room source and canonical state?")) return;
    const transport = transportRef.current;
    if (!transport) return;
    try {
      const snapshot = await transport.recover();
      await transport.sendCommand({ type: "end_session", idempotencyKey: crypto.randomUUID(), expectedRevision: snapshot.revision, clientTimestamp: new Date().toISOString() });
      await transport.deleteSession();
      setCanonical((current) => pairedCanonicalStateSchema.parse({ ...current, stage: "ended" }));
    } catch (cause) { setConnection("error"); setMessage(cause instanceof Error ? cause.message : "Session could not be deleted."); }
  }

  if (canonical.stage === "ended") return <main className="wall-ended" id="main-content"><div><Check aria-hidden="true" /><p className="eyebrow">Session deleted</p><h1>This room has left the wall.</h1><p>The stored source and canonical session state are no longer available. Start a new Studio Wall when you are ready.</p><Link href="/wall">Create another wall</Link></div></main>;
  return (
    <main className="wall-shell" id="main-content">
      <header className="wall-header">
        <Link className="wordmark" href="/wall">Interiorin</Link>
        <span className={`connection-pill connection-pill--${connection}`}><Radio size={16} aria-hidden="true" /> {joined ? "Phone paired" : connection}</span>
        <div className="wall-header-actions"><Link className="paired-text-link" href="/studio">Combined studio</Link><button type="button" onClick={() => void endSession()} aria-label="End and delete session"><Trash2 aria-hidden="true" /></button></div>
      </header>
      {canonical.options.length && selectedOption ? <section className="wall-product" aria-labelledby="wall-options-title">
        <div className="wall-modebar"><div><p className="eyebrow">Canonical room · revision synchronized</p><h1 id="wall-options-title">{wallMode === "compare" ? "Version comparison" : wallMode === "review" ? "Architect review" : wallMode === "reveal" ? "Room Reveal" : selectedOption.name}</h1></div><div role="group" aria-label="Wall mode"><button aria-pressed={wallMode === "explore"} onClick={() => setWallMode("explore")}>Explore</button><button aria-pressed={wallMode === "model"} onClick={() => setWallMode("model")}>Model</button>{canonical.visualReveal?.objectPath ? <button aria-pressed={wallMode === "reveal"} onClick={() => setWallMode("reveal")}>Reveal</button> : null}{canonical.comparison ? <button aria-pressed={wallMode === "compare"} onClick={() => setWallMode("compare")}>Compare</button> : null}{reviewVersion ? <button aria-pressed={wallMode === "review"} onClick={() => setWallMode("review")}>Review</button> : null}</div></div>
        {captureVersion ? <SnapshotCapture version={captureVersion} onCaptured={storeSnapshot} /> : null}
        {wallMode === "review" && reviewVersion ? <WallReview sessionId={sessionId} canonical={canonical} version={reviewVersion} snapshotUrl={snapshotUrls[reviewVersion.id]} /> : wallMode === "compare" && comparisonVersions.length === 2 ? <WallComparison first={comparisonVersions[0]!} second={comparisonVersions[1]!} snapshotUrls={snapshotUrls} captureFailures={captureFailures} /> : wallMode === "reveal" && canonical.visualReveal?.objectPath ? <WallReveal canonical={canonical} sourceUrl={revealUrls.source} revealUrl={revealUrls.reveal} /> : <div className="wall-product-grid">
          <div className="wall-canvas"><StudioModel scene={selectedOption.scene} /></div>
          <aside className="wall-options-rail" aria-label="Generated room directions">
            <p className="eyebrow">{wallMode === "explore" ? "Three checked directions" : "Selected direction"}</p>
            {wallMode === "explore" ? canonical.options.map((option, index) => <article key={option.id} data-selected={option.id === selectedOption.id}><span>0{index + 1}</span><div><small>{option.principle}</small><h2>{option.name}</h2><p>{option.rationale}</p></div></article>) : <><h2>{selectedOption.principle}</h2><p>{selectedOption.rationale}</p><dl><div><dt>Envelope</dt><dd>{selectedOption.scene.zones[0]?.polygon[1]?.x.toFixed(1)} m declared width</dd></div><div><dt>Objects</dt><dd>{selectedOption.scene.objects.length} canonical objects</dd></div><div><dt>Authority</dt><dd>Dimensions entered on phone</dd></div></dl></>}
            {activeProposal ? <section className="wall-live-trace" aria-label="Live Decision Trace" aria-live="polite"><p className="eyebrow">Decision Trace · {activeProposal.id.slice(0, 8)}</p><blockquote>{activeProposal.transcript}</blockquote><ol><li className="is-done"><Check />Request received</li><li className="is-done"><Check />Interpreted · {activeProposal.interpretation.mode.replaceAll("_", " ")}</li><li className="is-done"><Check />Typed schema valid</li><li className={activeProposal.receipt ? "is-done" : ""}>{activeProposal.receipt ? <Check /> : null}Spatially checked</li><li className={activeProposal.status === "awaiting_approval" ? "is-active" : activeProposal.status === "committed" || activeProposal.status === "rejected" ? "is-done" : ""}>{activeProposal.status === "committed" || activeProposal.status === "rejected" ? <Check /> : null}{activeProposal.status.replaceAll("_", " ")}</li></ol>{activeProposal.receipt ? <p data-status={activeProposal.receipt.status}>{activeProposal.receipt.message}</p> : <p>{activeProposal.interpretation.clarification}</p>}<small>{activeProposal.interpretation.disclosure}</small></section> : null}
            {canonical.visualReveal?.status === "requested" ? <p className="wall-reveal-progress" aria-live="polite"><Sparkles aria-hidden="true" /> Generating visual reveal</p> : canonical.visualReveal?.status === "failed" ? <p className="wall-reveal-progress" data-status="failed"><CircleAlert aria-hidden="true" /> {canonical.visualReveal.failure}</p> : null}
            <div className="event-ribbon"><span>{events.length} verified events</span><code>{canonical.stage.toUpperCase()}</code></div>
          </aside>
        </div>}
      </section> : <section className="wall-stage" aria-labelledby="wall-title">
        <div className="wall-hero">
          <p className="eyebrow">Studio Wall · pairing proof</p>
          <h1 id="wall-title">{joined ? "The conversation can begin." : "Pair the room with this wall."}</h1>
          <p>{message}</p>
          <div className="wall-session-id"><Link2 size={18} aria-hidden="true" /><span>Session</span><code>{sessionId.slice(0, 8)}</code></div>
          {session?.qrDataUrl && !joined ? (
            <figure className="pairing-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={session.qrDataUrl} alt="QR code to open the private phone controller" />
              <figcaption><ScanLine aria-hidden="true" /> Scan with the phone camera <strong>{session.pairingCode}</strong></figcaption>
            </figure>
          ) : !joined ? <p className="paired-notice"><CircleAlert aria-hidden="true" /> Pairing QR is no longer held after refresh. Create a new wall if the phone has not joined.</p> : null}
          <p className="privacy-line"><ShieldCheck aria-hidden="true" /> {session?.disclosure ?? (mode === "same_device" ? "Same-device demo mode is active." : "Private paired session.")}</p>
        </div>
        <aside className="decision-trace" aria-label="Decision Trace">
          <div><p className="eyebrow">Decision Trace</p><h2>Observable, not theatrical</h2></div>
          <ol>
            <TraceStep done label="Wall authenticated" detail="Anonymous authenticated identity" />
            <TraceStep done={connection !== "connecting" && connection !== "error"} label="Private channel ready" detail={mode === "supabase" ? "Membership-authorized Realtime" : "Same-origin local channel"} />
            <TraceStep done={joined} active={!joined} label="Controller joined" detail={mode === "supabase" ? "Authenticated phone · one controller" : "Same-browser fallback · one controller"} />
            <TraceStep done={Boolean(canonical.source)} active={joined && !canonical.source} label="Room intake" detail={canonical.source ? `${canonical.source.dimensions.widthM.toFixed(1)} × ${canonical.source.dimensions.depthM.toFixed(1)} × ${canonical.source.dimensions.heightM.toFixed(1)} m declared · photo secured` : "Waiting for photo and declared dimensions"} />
            <TraceStep done={Boolean(canonical.brief)} active={Boolean(canonical.source) && !canonical.brief} label="Homeowner intent" detail={canonical.brief ? "Confirmed brief synchronized" : "Waiting for the phone brief"} />
          </ol>
          <div className="event-ribbon" aria-live="polite">
            <span>{events.length} verified event{events.length === 1 ? "" : "s"}</span>
            <code>{mode === "supabase" ? "PRIVATE / REALTIME" : "DISCLOSED / SAME DEVICE"}</code>
          </div>
        </aside>
      </section>}
    </main>
  );
}

function wallProgressMessage(canonical: PairedCanonicalState, paired: boolean) {
  if (!paired) return "Channel ready. Scan the code with the homeowner’s phone.";
  if (!canonical.source) return "Phone connected. Continue with the room photo and declared dimensions.";
  if (!canonical.brief) return "Room intake synchronized. Continue with the homeowner intent on the phone.";
  if (!canonical.options.length) return "Brief confirmed. Building three checked directions.";
  return "Phone and Studio Wall are synchronized.";
}

function WallReveal({ canonical, sourceUrl, revealUrl }: { canonical: PairedCanonicalState; sourceUrl?: string; revealUrl?: string }) {
  const selected = canonical.options.find((option) => option.id === canonical.selectedOptionId);
  const reveal = canonical.visualReveal;
  if (!selected || !reveal) return null;
  const stale = reveal.status === "stale";
  return <section className="wall-reveal" aria-labelledby="wall-reveal-heading">
    <header><div><p className="eyebrow">Source → checked 3D → visual hypothesis</p><h2 id="wall-reveal-heading">{selected.name} in the photographed room</h2></div><span data-status={reveal.status}>{stale ? "Earlier revision · 3D has changed" : `Current design revision ${reveal.canonicalRevision}`}</span></header>
    <div className="wall-reveal-grid">
      <figure>{sourceUrl ? <Image src={sourceUrl} alt="Original private room photograph" width={1280} height={900} unoptimized /> : <div className="snapshot-fallback"><strong>Loading private source</strong><span>The photograph remains in session-scoped Storage.</span></div>}<figcaption><strong>01 · Source photograph</strong><span>Architecture and camera authority</span></figcaption></figure>
      <figure><div className="wall-reveal-model"><StudioModel scene={selected.scene} /></div><figcaption><strong>02 · Canonical 3D</strong><span>Dimensions, positions, materials, and checks</span></figcaption></figure>
      <figure>{revealUrl ? <Image src={revealUrl} alt={`AI visual hypothesis for ${selected.name}`} width={1280} height={900} unoptimized /> : <div className="snapshot-fallback"><strong>Loading private Reveal</strong><span>The generated image never travels through Realtime.</span></div>}<figcaption><strong>03 · Nano Banana Reveal</strong><span>{reveal.model} · {reveal.createdAt ? new Date(reveal.createdAt).toLocaleString() : "Preparing"}</span></figcaption></figure>
    </div>
    <footer><ShieldCheck aria-hidden="true" /><p><strong>AI visual hypothesis—not measured.</strong> The Reveal is a presentation layer. Canonical 3D, entered dimensions, deterministic validation, and receipts remain authoritative.</p></footer>
  </section>;
}

export function buildArchitectReviewPayload(sessionId: string, canonical: PairedCanonicalState, version: PairedVersion) {
  const validation = validateScene(version.scene);
  const objectSchedule = version.scene.objects.map((object) => ({ id: object.id, label: object.label, category: object.category, assetId: object.assetId, dimensionsMeters: object.dimensions, positionMeters: object.transform.position, rotationRadians: object.transform.rotation, materialIds: object.materialIds, protected: object.protected, placementClass: object.placementClass, provenance: object.provenance }));
  const surfaceSchedule = [...version.scene.zones.map((zone) => ({ id: zone.id, label: zone.label, kind: zone.kind, materialId: zone.materialId, protected: zone.protected, provenance: zone.provenance })), ...version.scene.objects.filter((object) => object.materialIds.length).map((object) => ({ id: object.id, label: object.label, kind: object.category, materialIds: object.materialIds, protected: object.protected, provenance: object.provenance }))];
  return {
    schemaVersion: "1.0",
    packageType: "architect_concept_review",
    disclosure: "Concept design only — not construction documentation. Verify field measurements, drawings, code, engineering, permits, products, and procurement with qualified professionals.",
    exportedAt: new Date().toISOString(), sessionId,
    brief: canonical.brief, declaredDimensionsMeters: canonical.source?.dimensions,
    selectedVersion: version,
    alternatives: canonical.versions.filter((candidate) => candidate.id !== version.id).map((candidate) => ({ id: candidate.id, name: candidate.name, optionId: candidate.optionId, createdAt: candidate.createdAt })),
    optionRationale: canonical.options.find((option) => option.id === version.optionId)?.rationale,
    objectSchedule, surfaceSchedule, validation,
    receipts: canonical.receipts,
    visualRevealProvenance: canonical.visualReveal?.objectPath ? { status: canonical.visualReveal.status, canonicalRevision: canonical.visualReveal.canonicalRevision, model: canonical.visualReveal.model, responseId: canonical.visualReveal.responseId, createdAt: canonical.visualReveal.createdAt, disclosure: canonical.visualReveal.disclosure } : undefined,
    unresolvedChecks: ["Field-verify all entered dimensions and existing conditions.", "Architect to verify egress, accessibility, code, structure, services, and buildability.", ...validation.findings.map((finding) => finding.message)],
  };
}

function WallReview({ sessionId, canonical, version, snapshotUrl }: { sessionId: string; canonical: PairedCanonicalState; version: PairedVersion; snapshotUrl?: string }) {
  const payload = useMemo(() => buildArchitectReviewPayload(sessionId, canonical, version), [canonical, sessionId, version]);
  const rationale = canonical.options.find((option) => option.id === version.optionId)?.rationale;
  function downloadJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `interiorin-${version.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-concept-review.json`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return <section className="wall-review"><div className="wall-review-actions"><p><strong>{version.name}</strong> is the single selected review source.</p><div><button type="button" onClick={() => window.print()}><Printer aria-hidden="true" /> Print / save sheet</button><button type="button" onClick={downloadJson}><Download aria-hidden="true" /> Download structured JSON</button></div></div><article className="review-sheet" aria-labelledby="review-sheet-title"><header><div><p className="eyebrow">Interiorin · architect concept review</p><h2 id="review-sheet-title">{version.name}</h2><p>{rationale}</p></div><strong>Concept design<br />not construction documentation</strong></header><section className="review-hero"><div>{snapshotUrl ? <Image src={snapshotUrl} alt={`Selected canonical view of ${version.name}`} width={960} height={600} unoptimized /> : <div className="snapshot-fallback"><strong>Canonical snapshot unavailable</strong><span>The structured scene and schedules remain authoritative.</span></div>}</div><dl><div><dt>Intent</dt><dd>{canonical.brief?.purpose}</dd></div><div><dt>Desired feeling</dt><dd>{canonical.brief?.feeling}</dd></div><div><dt>Declared envelope</dt><dd>{canonical.source ? `${canonical.source.dimensions.widthM.toFixed(2)} × ${canonical.source.dimensions.depthM.toFixed(2)} × ${canonical.source.dimensions.heightM.toFixed(2)} m` : "Not entered"}</dd></div><div><dt>Validation</dt><dd>{payload.validation.status.toUpperCase()} · {payload.validation.findings.length} finding(s)</dd></div></dl></section><ReviewTable title="Object schedule" columns={["Object", "Size W × D × H", "Position x / z", "Rotation", "Materials · authority"]} rows={version.scene.objects.map((object) => [object.label, `${object.dimensions.width.toFixed(2)} × ${object.dimensions.depth.toFixed(2)} × ${object.dimensions.height.toFixed(2)} m`, `${object.transform.position.x.toFixed(2)} / ${object.transform.position.z.toFixed(2)} m`, `${Math.round(object.transform.rotation.y * 180 / Math.PI)}°`, `${object.materialIds.join(", ") || "—"} · ${object.provenance.authority.replaceAll("_", " ")}${object.protected ? " · protected" : ""}`])} /><ReviewTable title="Surface and material schedule" columns={["Surface", "Kind", "Material", "Authority"]} rows={version.scene.zones.map((zone) => [zone.label, zone.kind, zone.materialId, zone.provenance.authority.replaceAll("_", " ")])} /><section className="review-findings"><div><h3>Spatial validation</h3>{payload.validation.findings.length ? <ul>{payload.validation.findings.map((finding) => <li key={finding.id} data-severity={finding.severity}><strong>{finding.type}</strong>{finding.message}{finding.measuredMeters !== undefined ? <span>Measured {Math.round(finding.measuredMeters * 1000)} mm{finding.requiredMeters ? ` · target ${Math.round(finding.requiredMeters * 1000)} mm` : ""}</span> : null}</li>)}</ul> : <p>No deterministic envelope, overlap, or configured-clearance findings in this concept scene.</p>}</div><div><h3>Decision receipts</h3>{canonical.receipts.length ? <ul>{canonical.receipts.map((receipt) => <li key={receipt.id}><strong>{receipt.status.replaceAll("_", " ")}</strong><span>{receipt.transcript}</span><small>{receipt.receipt?.message ?? receipt.interpretation.disclosure}</small></li>)}</ul> : <p>No accepted or rejected refinement receipts were recorded.</p>}</div></section><section className="review-boundary"><h3>Open professional checks</h3><ul>{payload.unresolvedChecks.map((question) => <li key={question}>{question}</li>)}</ul><p><strong>Professional boundary.</strong> This package does not replace a survey, field measurements, architectural drawings, code review, accessibility review, engineering, permits, product verification, procurement, or construction administration.</p></section><footer><span>Interiorin canonical scene · {version.id.slice(0, 8)}</span><span>Generated {new Date(payload.exportedAt).toLocaleString()}</span></footer></article></section>;
}

function ReviewTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return <section className="review-table"><h3>{title}</h3><div><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${title}-${rowIndex}`}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={columns[cellIndex]}>{cell}</th> : <td key={columns[cellIndex]}>{cell}</td>)}</tr>)}</tbody></table></div></section>;
}

function SnapshotCapture({ version, onCaptured }: { version: PairedVersion; onCaptured: (versionId: string, blob: Blob | null) => void }) {
  const modelRef = useRef<StudioModelHandle>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let active = true;
    async function capture() {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      let blob: Blob | null = null;
      try { blob = await modelRef.current?.captureCanonical() ?? null; } catch { blob = null; }
      if (active) onCaptured(version.id, blob);
    }
    void capture();
    return () => { active = false; };
  }, [onCaptured, version.id]);
  return <div className="snapshot-capture" aria-hidden="true"><StudioModel ref={modelRef} scene={version.scene} /></div>;
}

function WallComparison({ first, second, snapshotUrls, captureFailures }: { first: PairedVersion; second: PairedVersion; snapshotUrls: Record<string, string>; captureFailures: Set<string> }) {
  const diff = useMemo(() => compareScenes(first.scene, second.scene), [first.scene, second.scene]);
  const rows = [
    ...diff.addedObjects.map((object) => ({ item: object.label, change: "Added", before: "—", after: object.assetId })),
    ...diff.removedObjects.map((object) => ({ item: object.label, change: "Removed", before: object.assetId, after: "—" })),
    ...diff.movedObjects.map((change) => ({ item: change.label, change: "Moved", before: `x ${change.before.x.toFixed(2)} · z ${change.before.z.toFixed(2)} m`, after: `x ${change.after.x.toFixed(2)} · z ${change.after.z.toFixed(2)} m` })),
    ...diff.rotatedObjects.map((change) => ({ item: change.label, change: "Rotated", before: `${Math.round(change.before * 180 / Math.PI)}°`, after: `${Math.round(change.after * 180 / Math.PI)}°` })),
    ...diff.replacedObjects.map((change) => ({ item: change.label, change: "Replaced", before: change.before, after: change.after })),
    ...diff.materialChanges.map((change) => ({ item: change.label, change: "Material", before: change.before, after: change.after })),
    ...(diff.environmentChange ? [{ item: diff.environmentChange.label, change: "Environment", before: `${diff.environmentChange.before.warmth} · ${diff.environmentChange.before.intensity}`, after: `${diff.environmentChange.after.warmth} · ${diff.environmentChange.after.intensity}` }] : []),
  ];
  const counts = [{ label: "moved", count: diff.movedObjects.length }, { label: "rotated", count: diff.rotatedObjects.length }, { label: "replaced", count: diff.replacedObjects.length }, { label: "material", count: diff.materialChanges.length }, { label: "added", count: diff.addedObjects.length }, { label: "removed", count: diff.removedObjects.length }].filter((item) => item.count);
  const summary = counts.length ? counts.map((item) => `${item.count} ${item.label}`).join(" · ") : "No canonical differences";
  return <section className="wall-compare" aria-labelledby="comparison-heading"><div className="wall-compare-intro"><p className="eyebrow">Exact canonical views</p><h2 id="comparison-heading">{first.name} <span>versus</span> {second.name}</h2><p>{summary}. The factual table below remains the authoritative receipt.</p><span className="sr-only" aria-live="polite">Comparing {first.name} and {second.name}.</span></div><div className="wall-compare-figures">{[first, second].map((version) => <figure key={version.id}>{snapshotUrls[version.id] ? <Image src={snapshotUrls[version.id]!} alt={`Canonical 3D snapshot of ${version.name}`} width={960} height={600} unoptimized /> : <div className="snapshot-fallback"><strong>{captureFailures.has(version.id) ? "Snapshot unavailable" : "Preparing canonical snapshot"}</strong><span>{captureFailures.has(version.id) ? "WebGL capture failed; factual comparison remains available." : "Rendering the stored canonical scene."}</span></div>}<figcaption><strong>{version.name}</strong><span>{version.scene.objects.length} canonical objects · {new Date(version.createdAt).toLocaleString()}</span></figcaption></figure>)}</div><div className="comparison-table-wrap"><table><caption>Authoritative scene changes from {first.name} to {second.name}</caption><thead><tr><th>Item</th><th>Change</th><th>Before</th><th>After</th></tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={`${row.item}-${row.change}-${index}`}><th scope="row">{row.item}</th><td>{row.change}</td><td>{row.before}</td><td>{row.after}</td></tr>) : <tr><td colSpan={4}>The stored canonical scenes are identical.</td></tr>}</tbody></table></div></section>;
}

function TraceStep({ done, active = false, label, detail }: { done: boolean; active?: boolean; label: string; detail: string }) {
  return <li className={done ? "is-done" : active ? "is-active" : ""}><span>{done ? <Check aria-hidden="true" /> : null}</span><div><strong>{label}</strong><small>{detail}</small></div></li>;
}
