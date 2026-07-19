"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, CircleAlert, Link2, Radio, ScanLine, ShieldCheck } from "lucide-react";
import { pairedCanonicalStateSchema, type PairedCanonicalState, type SessionCreateEnvelope, type StudioEvent } from "@/lib/session/schema";
import { createSessionTransport } from "@/lib/session/transport";
import { StudioModel, type StudioModelHandle } from "@/components/product/studio-model";
import { compareScenes } from "@/lib/spatial/diff";

type PairedVersion = PairedCanonicalState["versions"][number];

export function WallSession({ sessionId }: { sessionId: string }) {
  const [session] = useState<SessionCreateEnvelope | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(`interiorin:created:${sessionId}`);
    return raw ? JSON.parse(raw) as SessionCreateEnvelope : null;
  });
  const [connection, setConnection] = useState<"connecting" | "waiting" | "paired" | "error">("connecting");
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [message, setMessage] = useState("Opening the private session channel…");
  const [canonical, setCanonical] = useState<PairedCanonicalState>(() => pairedCanonicalStateSchema.parse({}));
  const [wallMode, setWallMode] = useState<"explore" | "model" | "compare">("explore");
  const [snapshotUrls, setSnapshotUrls] = useState<Record<string, string>>({});
  const [captureFailures, setCaptureFailures] = useState<Set<string>>(() => new Set());
  const [captureVersionId, setCaptureVersionId] = useState("");
  const snapshotUrlsRef = useRef<Record<string, string>>({});

  const mode = useMemo(() => session?.mode ?? (typeof window === "undefined" ? "same_device" : (localStorage.getItem(`interiorin:mode:${sessionId}`) as "supabase" | "same_device" | null) ?? "same_device"), [session, sessionId]);

  useEffect(() => {
    const transport = createSessionTransport(mode, sessionId, "wall");
    let mounted = true;
    async function recover() {
      const snapshot = await transport.recover().catch(() => null);
      if (!mounted || !snapshot) return;
      setEvents(snapshot.events);
      const nextCanonical = pairedCanonicalStateSchema.parse(snapshot.canonicalState);
      setCanonical(nextCanonical);
      if (nextCanonical.comparison) setWallMode("compare");
      const paired = snapshot.members.some((member) => member.role === "controller");
      setConnection(paired ? "paired" : "waiting");
      setMessage(paired ? "Phone controller recovered and authenticated." : "Channel ready. Scan the code with the homeowner’s phone.");
    }
    const unsubscribe = transport.subscribe((event) => {
      if (!mounted) return;
      setEvents((current) => [...current.filter((item) => item.id !== event.id), event].slice(-12));
      if (event.eventType === "controller_joined") {
        setConnection("paired");
        setMessage("Phone controller authenticated. The wall is ready for room intake.");
      }
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
    return () => { mounted = false; if (poll) window.clearInterval(poll); unsubscribe(); void transport.dispose(); };
  }, [mode, sessionId]);

  const joined = connection === "paired";
  const selectedOption = canonical.options.find((option) => option.id === canonical.selectedOptionId) ?? canonical.options[0];
  const activeProposal = canonical.proposals.at(-1);
  const comparisonVersions = useMemo(() => canonical.comparison ? [canonical.versions.find((version) => version.id === canonical.comparison?.firstVersionId), canonical.versions.find((version) => version.id === canonical.comparison?.secondVersionId)].filter((version): version is PairedVersion => Boolean(version)) : [], [canonical.comparison, canonical.versions]);
  const captureVersion = canonical.versions.find((version) => version.id === captureVersionId);

  useEffect(() => () => { Object.values(snapshotUrlsRef.current).forEach((url) => URL.revokeObjectURL(url)); }, []);
  useEffect(() => {
    if (captureVersionId) return;
    const next = comparisonVersions.find((version) => !snapshotUrls[version.id] && !captureFailures.has(version.id));
    if (!next) return;
    const timer = window.setTimeout(() => setCaptureVersionId(next.id), 0);
    return () => window.clearTimeout(timer);
  }, [captureFailures, captureVersionId, comparisonVersions, snapshotUrls]);

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
  return (
    <main className="wall-shell" id="main-content">
      <header className="wall-header">
        <Link className="wordmark" href="/wall">Interiorin</Link>
        <span className={`connection-pill connection-pill--${connection}`}><Radio size={16} aria-hidden="true" /> {joined ? "Phone paired" : connection}</span>
        <Link className="paired-text-link" href="/studio">Combined studio</Link>
      </header>
      {canonical.options.length && selectedOption ? <section className="wall-product" aria-labelledby="wall-options-title">
        <div className="wall-modebar"><div><p className="eyebrow">Canonical room · revision synchronized</p><h1 id="wall-options-title">{wallMode === "compare" ? "Version comparison" : selectedOption.name}</h1></div><div role="group" aria-label="Wall mode"><button aria-pressed={wallMode === "explore"} onClick={() => setWallMode("explore")}>Explore</button><button aria-pressed={wallMode === "model"} onClick={() => setWallMode("model")}>Model</button>{canonical.comparison ? <button aria-pressed={wallMode === "compare"} onClick={() => setWallMode("compare")}>Compare</button> : null}</div></div>
        {captureVersion ? <SnapshotCapture version={captureVersion} onCaptured={storeSnapshot} /> : null}
        {wallMode === "compare" && comparisonVersions.length === 2 ? <WallComparison first={comparisonVersions[0]!} second={comparisonVersions[1]!} snapshotUrls={snapshotUrls} captureFailures={captureFailures} /> : <div className="wall-product-grid">
          <div className="wall-canvas"><StudioModel scene={selectedOption.scene} /></div>
          <aside className="wall-options-rail" aria-label="Generated room directions">
            <p className="eyebrow">{wallMode === "explore" ? "Three checked directions" : "Selected direction"}</p>
            {wallMode === "explore" ? canonical.options.map((option, index) => <article key={option.id} data-selected={option.id === selectedOption.id}><span>0{index + 1}</span><div><small>{option.principle}</small><h2>{option.name}</h2><p>{option.rationale}</p></div></article>) : <><h2>{selectedOption.principle}</h2><p>{selectedOption.rationale}</p><dl><div><dt>Envelope</dt><dd>{selectedOption.scene.zones[0]?.polygon[1]?.x.toFixed(1)} m declared width</dd></div><div><dt>Objects</dt><dd>{selectedOption.scene.objects.length} canonical objects</dd></div><div><dt>Authority</dt><dd>Dimensions entered on phone</dd></div></dl></>}
            {activeProposal ? <section className="wall-live-trace" aria-label="Live Decision Trace" aria-live="polite"><p className="eyebrow">Decision Trace · {activeProposal.id.slice(0, 8)}</p><blockquote>{activeProposal.transcript}</blockquote><ol><li className="is-done"><Check />Request received</li><li className="is-done"><Check />Interpreted · {activeProposal.interpretation.mode.replaceAll("_", " ")}</li><li className="is-done"><Check />Typed schema valid</li><li className={activeProposal.receipt ? "is-done" : ""}>{activeProposal.receipt ? <Check /> : null}Spatially checked</li><li className={activeProposal.status === "awaiting_approval" ? "is-active" : activeProposal.status === "committed" || activeProposal.status === "rejected" ? "is-done" : ""}>{activeProposal.status === "committed" || activeProposal.status === "rejected" ? <Check /> : null}{activeProposal.status.replaceAll("_", " ")}</li></ol>{activeProposal.receipt ? <p data-status={activeProposal.receipt.status}>{activeProposal.receipt.message}</p> : <p>{activeProposal.interpretation.clarification}</p>}<small>{activeProposal.interpretation.disclosure}</small></section> : null}
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
            <TraceStep done={joined} active={!joined} label="Controller joined" detail="Single-use token · one controller" />
            <TraceStep done={false} label="Room intake" detail="Waiting for photo and declared dimensions" />
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
