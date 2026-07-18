"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  Copy,
  Eye,
  RotateCcw,
  ShieldCheck,
  UserRoundCheck,
  WifiOff,
} from "lucide-react";
import {
  preparedProposalFallback,
  proposalEnvelopeSchema,
  proposalToSceneAction,
  type ProposalProviderMode,
} from "@/lib/ai/proposal";
import { declareObjectWidthForSession } from "@/lib/spatial/fact-authority";
import { clonePreparedScene } from "@/lib/spatial/prepared-scenes";
import { authorityProjection, buildAuthorityProof, type AuthorityProof, type ProjectionDigest } from "@/lib/spatial/proof";
import { freezeSceneAction, type SceneAction, type SpatialScene } from "@/lib/spatial/schema";
import { buildBasicReceipt, type BasicReceipt } from "@/lib/spatial/receipt";
import { commitTruthContractOutcome } from "@/lib/spatial/transaction";
import { evaluateTruthContract, type TruthContractOutcome } from "@/lib/spatial/truth-contract";
import { SceneCanvas } from "./scene-canvas";

const demoRequest = "Move the dining table 40 cm toward the bookcase. Keep the 90 cm path and do not touch the heirloom bookcase.";
type Stage = "ready" | "evidence_required" | "proof_pending" | "evidence_recorded" | "proof_invalid" | "limited" | "committed";

const authorityLabel = {
  verified: "Measured/verified",
  user_declared: "User-declared",
  observed_unverified: "Observed-unverified",
  inferred: "Inferred",
  generated: "Presentation only",
};

const factLabels: Record<string, string> = {
  "bookcase.center_x_mm": "Bookcase centre x",
  "bookcase.width_mm": "Bookcase width",
  "path.minimum_clearance_mm": "Minimum path clearance",
  "table.center_x_mm": "Table centre x",
  "table.width_mm": "Table width",
};

export function SpatialStudio() {
  const [scene, setScene] = useState<SpatialScene>(() => clonePreparedScene("interior"));
  const [stage, setStage] = useState<Stage>("ready");
  const [outcome, setOutcome] = useState<TruthContractOutcome>();
  const [receipt, setReceipt] = useState<BasicReceipt>();
  const [providerMode, setProviderMode] = useState<ProposalProviderMode>();
  const [providerModel, setProviderModel] = useState<string>();
  const [providerRequestId, setProviderRequestId] = useState<string>();
  const [providerDisclosure, setProviderDisclosure] = useState("No proposal request has been made.");
  const [isClarifying, setIsClarifying] = useState(false);
  const [proof, setProof] = useState<AuthorityProof>();
  const [forceOffline, setForceOffline] = useState(false);
  const [frozenAction, setFrozenAction] = useState<SceneAction>();
  const [measurementAttested, setMeasurementAttested] = useState(false);
  const stateHeading = useRef<HTMLHeadingElement>(null);

  const previewPosition = outcome?.decision === "limited" && outcome.effectiveAction?.type === "move_object"
    ? outcome.effectiveAction.position
    : undefined;
  const requestedCentimeters = frozenAction?.type === "move_object"
    ? Math.round((frozenAction.position.x - 0.92) * 100)
    : 40;
  const resultIsVisible = stage === "limited" || stage === "committed";

  useEffect(() => {
    if (stage !== "ready") stateHeading.current?.focus();
  }, [stage]);

  async function runCheck() {
    setIsClarifying(true);
    setProof(undefined);
    setReceipt(undefined);
    let selectedAction: SceneAction | undefined;

    if (forceOffline) {
      const prepared = preparedProposalFallback(demoRequest);
      setProviderMode("prepared_fallback");
      setProviderDisclosure("Prepared fallback · no model request");
      if (prepared.status === "resolved") {
        selectedAction = freezeSceneAction(proposalToSceneAction(scene, prepared));
      }
    } else {
      try {
        const response = await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request: demoRequest }),
        });
        if (!response.ok) throw new Error("Proposal endpoint rejected the request");
        const envelope = proposalEnvelopeSchema.parse(await response.json());
        setProviderMode(envelope.mode);
        setProviderModel(envelope.mode === "gpt-5.6-terra" ? envelope.model : undefined);
        setProviderRequestId(envelope.mode === "gpt-5.6-terra" ? envelope.requestId : undefined);
        setProviderDisclosure(envelope.disclosure);
        if (envelope.result.status === "needs_clarification") {
          setProviderDisclosure(envelope.result.question);
          return;
        }
        selectedAction = freezeSceneAction(proposalToSceneAction(scene, envelope.result));
      } catch {
        const prepared = preparedProposalFallback(demoRequest);
        setProviderMode("prepared_fallback");
        setProviderDisclosure("Proposal route unavailable · prepared fallback · no model result used");
        if (prepared.status === "resolved") {
          selectedAction = freezeSceneAction(proposalToSceneAction(scene, prepared));
        }
      } finally {
        setIsClarifying(false);
      }
    }

    if (!selectedAction) {
      setIsClarifying(false);
      return;
    }
    setFrozenAction(selectedAction);
    const next = evaluateTruthContract(scene, selectedAction);
    setOutcome(next);
    setStage(next.decision === "confirmation_required" ? "evidence_required" : "limited");
    setIsClarifying(false);
  }

  async function recordMeasurement() {
    if (!frozenAction || !measurementAttested) return;
    const recordedAt = new Date().toISOString();
    const eventId = crypto.randomUUID();
    const declaredScene = declareObjectWidthForSession(scene, "bookcase", {
      width: 1,
      sourceLabel: "Measured by homeowner with tape in this session",
      sourceRef: `session.homeowner-tape/${eventId}`,
      eventId,
      recordedAt,
    });
    setStage("proof_pending");
    try {
      const nextProof = await buildAuthorityProof(scene, declaredScene, frozenAction, frozenAction);
      setProof(nextProof);
      if (!nextProof.valid) {
        setStage("proof_invalid");
        return;
      }
      setScene(declaredScene);
      setStage("evidence_recorded");
    } catch {
      setProof(undefined);
      setStage("proof_invalid");
    }
  }

  function rerunSameCheck() {
    if (!frozenAction || !proof?.valid) return;
    const next = evaluateTruthContract(scene, frozenAction);
    setOutcome(next);
    setStage(next.decision === "limited" ? "limited" : "proof_invalid");
  }

  async function acceptAlternative() {
    if (!outcome || !proof?.valid || stage !== "limited") return;
    const committed = commitTruthContractOutcome(scene, outcome);
    const decisionReceipt = await buildBasicReceipt(scene, committed.scene, outcome, proof, {
      mode: providerMode ?? "prepared_fallback",
      model: providerModel,
      requestId: providerRequestId,
      disclosure: providerDisclosure,
    });
    setScene(committed.scene);
    setReceipt(decisionReceipt);
    setStage("committed");
  }

  function reset() {
    setScene(clonePreparedScene("interior"));
    setOutcome(undefined);
    setReceipt(undefined);
    setProviderMode(undefined);
    setProviderModel(undefined);
    setProviderRequestId(undefined);
    setProviderDisclosure("No proposal request has been made.");
    setIsClarifying(false);
    setProof(undefined);
    setForceOffline(false);
    setFrozenAction(undefined);
    setMeasurementAttested(false);
    setStage("ready");
  }

  return (
    <main className="studio-shell" id="main-content">
      <a className="skip-link" href="#decision-panel">Skip to decision proof</a>
      <header className="studio-header">
        <div className="brand-lockup"><span className="wordmark">Interiorin</span><span className="workspace-title">Prepared dining-room proof</span></div>
        <div className="release-truth"><ShieldCheck aria-hidden="true" size={17} /><span>Verified release slice · prepared interior proof</span></div>
        <button className="quiet-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" size={17} /> Reset proof</button>
      </header>

      <section className="disclosure-strip" aria-label="Release disclosures">
        <span><WifiOff aria-hidden="true" size={16} />{forceOffline ? "Prepared fallback · no model request" : "Provider not selected · no live claim"}</span>
        <span>Demo-authored fit policy · professional review required</span>
        <span>Session-only · no persistence</span>
      </section>

      <div className="studio-grid">
        <section className="decision-panel" id="decision-panel" aria-labelledby="proof-page-title">
          <div className="title-block">
            <p className="eyebrow">F2.R · authority proof</p>
            <h1 id="proof-page-title">An estimate may block. It may never authorize.</h1>
            <p>One prepared transaction shows why source authority—not model confidence—controls a fit-sensitive spatial decision.</p>
          </div>

          <article className="proposal-card" aria-labelledby="request-title">
            <div className="proposal-heading"><span>01</span><div><p>{providerMode === "prepared_fallback" ? "Prepared typed proposal" : providerMode === "gpt-5.6-terra" ? "Provider-returned typed proposal" : "Frozen request"}</p><h2 id="request-title">Move the table while protecting the path.</h2></div></div>
            <blockquote>{demoRequest}</blockquote>
            <code>move(table, +x, {requestedCentimeters * 10} mm)</code>
            <button className="mode-toggle" type="button" role="switch" aria-checked={forceOffline} onClick={() => setForceOffline((current) => !current)} disabled={stage !== "ready"}>
              <span aria-hidden="true" />Offline proof mode <strong>{forceOffline ? "On" : "Off"}</strong>
            </button>
            <small>{providerDisclosure}</small>
          </article>

          {stage === "ready" ? (
            <DecisionState headingRef={stateHeading} kicker="READY" title="No decision has run." body="Choose the prepared offline path, freeze its typed proposal once, then run Pass A.">
              <ActionButton onClick={runCheck} disabled={isClarifying}>{isClarifying ? "Clarifying request…" : "Clarify and check"}</ActionButton>
            </DecisionState>
          ) : null}

          {stage === "evidence_required" ? (
            <DecisionState headingRef={stateHeading} className="observed-state" kicker="CONFIRMATION REQUIRED" title="Geometry is computable. Authority is not." body="Bookcase width is a visual estimate from the prepared capture. The solver has not run." icon={<CircleAlert aria-hidden="true" size={16} />}>
              <div className="measurement-row"><label htmlFor="bookcase-width">Bookcase width</label><div><input id="bookcase-width" value="100" readOnly inputMode="decimal" /><span>cm</span></div><small>1,000 mm · visual estimate from prepared capture · observed, unverified</small></div>
              <label className="attestation-check"><input type="checkbox" checked={measurementAttested} onChange={(event) => setMeasurementAttested(event.target.checked)} /><span>I measured this 100 cm value for this session.</span></label>
              <p className="control-helper">{measurementAttested ? "Attestation recorded locally; ready to hash the authority event." : "Attest that you measured this value for this session."}</p>
              <ActionButton onClick={recordMeasurement} disabled={!measurementAttested}>Record measurement</ActionButton>
            </DecisionState>
          ) : null}

          {stage === "proof_pending" ? (
            <DecisionState headingRef={stateHeading} kicker="CHECKING UNCHANGED INPUTS" title="Hashing the six proof projections." body="Geometry, frozen transaction, and the five-fact authority tuple are being checked in the browser.">
              <span className="pending-copy" role="status" aria-live="polite">Checking unchanged inputs</span>
            </DecisionState>
          ) : null}

          {stage === "evidence_recorded" && proof ? (
            <DecisionState headingRef={stateHeading} className="declared-state" kicker="PROOF VALID" title="Only evidence authority changed." body="All six digests settled. Geometry and transaction match; one allowed fact tuple changed." icon={<Check aria-hidden="true" size={16} />}>
              <EventPanel scene={scene} />
              <ActionButton onClick={rerunSameCheck}>Rerun unchanged proposal</ActionButton>
            </DecisionState>
          ) : null}

          {stage === "proof_invalid" ? (
            <DecisionState headingRef={stateHeading} className="observed-state" kicker="PROOF INVALID" title="Proof validation failed." body="Reset and rerun; no solver or commit ran." icon={<CircleAlert aria-hidden="true" size={16} />}>
              <ActionButton onClick={reset}>Reset proof</ActionButton>
            </DecisionState>
          ) : null}

          {stage === "limited" ? (
            <DecisionState headingRef={stateHeading} className="declared-state" kicker="LIMITED · CHECKED ALTERNATIVE" title={`${requestedCentimeters} cm fails. 18 cm passes.`} body="Deterministic integer geometry found the maximum move that preserves the prepared 900 mm path.">
              <p className="equation"><span>3,300 − 500 − 900 − 800 − 920</span><strong>= 180 mm</strong></p>
              <ul className="check-list"><li><Check aria-hidden="true" size={16} />900 mm path retained</li><li><Check aria-hidden="true" size={16} />Bookcase unchanged</li><li><CircleAlert aria-hidden="true" size={16} />Professional review remains required</li></ul>
              <ActionButton onClick={acceptAlternative}>Accept 18 cm alternative</ActionButton>
            </DecisionState>
          ) : null}

          {stage === "committed" && receipt ? (
            <DecisionState headingRef={stateHeading} className="receipt-state" kicker="COMMITTED WITH RECEIPT" title="The checked alternative is now canonical." body="The request, checked outcome, provider truth, proof, and one-field scene diff remain inspectable." icon={<Check aria-hidden="true" size={16} />}>
              <Receipt receipt={receipt} />
            </DecisionState>
          ) : null}

          <FactLedger scene={scene} resultIsVisible={resultIsVisible} />
          <ProofPanel proof={proof} pending={stage === "proof_pending"} failed={stage === "proof_invalid"} />
        </section>

        <section className="scene-stage" aria-labelledby="scene-title">
          <div className="scene-toolbar"><div><p>Prepared 3D enhancement</p><h2 id="scene-title">Dining room · semantic proof remains primary</h2></div><span>Current geometry</span></div>
          <SceneCanvas scene={scene} previewPosition={previewPosition} />
          <div className="scene-metrics">
            <span>Requested <strong>+400 mm</strong></span>
            <span>Authorized result <strong>{resultIsVisible ? "+180 mm" : "Withheld"}</strong></span>
            <span>Canonical table x <strong>{stage === "committed" ? "1,100 mm" : "920 mm"}</strong></span>
          </div>
        </section>
      </div>
    </main>
  );
}

function FactLedger({ scene, resultIsVisible }: { scene: SpatialScene; resultIsVisible: boolean }) {
  const facts = authorityProjection(scene);
  const sourceFor = (factId: string) => {
    const table = scene.objects.find((object) => object.id === "table");
    const bookcase = scene.objects.find((object) => object.id === "bookcase");
    const path = scene.constraints.find((constraint) => constraint.id === "path-clearance");
    if (factId === "bookcase.center_x_mm") return bookcase?.provenance.sourceLabel;
    if (factId === "bookcase.width_mm") return (bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance)?.sourceLabel;
    if (factId === "path.minimum_clearance_mm") return path?.provenance.sourceLabel;
    if (factId === "table.center_x_mm") return table?.provenance.sourceLabel;
    return table?.dimensions.provenance.sourceLabel;
  };
  return (
    <section className="fact-ledger" aria-labelledby="fact-ledger-title">
      <div className="section-heading"><span>02</span><div><p>Always-mounted semantic proof</p><h2 id="fact-ledger-title">Five solver facts</h2></div></div>
      <div className="table-wrap">
        <table>
          <caption>Exact integer-millimetre inputs and authority bases used by the prepared fit solver.</caption>
          <thead><tr><th scope="col">Fact</th><th scope="col">Value</th><th scope="col">Source</th><th scope="col">Authority</th></tr></thead>
          <tbody>{facts.map((fact) => <tr key={fact.factId}><th scope="row"><code>{fact.factId}</code><span>{factLabels[fact.factId]}</span></th><td>{fact.valueMm.toLocaleString("en-US")} mm</td><td>{sourceFor(fact.factId)}</td><td><AuthorityMark authority={fact.authority} /></td></tr>)}</tbody>
          <tfoot><tr><th scope="row">Maximum checked move</th><td colSpan={3}>{resultIsVisible ? <strong>180 mm · 900 mm path retained</strong> : <strong>Withheld — supporting fact lacks authority.</strong>}</td></tr></tfoot>
        </table>
      </div>
    </section>
  );
}

function AuthorityMark({ authority }: { authority: keyof typeof authorityLabel }) {
  const Icon = authority === "verified" ? BadgeCheck : authority === "user_declared" ? UserRoundCheck : Eye;
  return <span className="authority-mark" data-authority={authority}><Icon aria-hidden="true" size={16} />{authorityLabel[authority]}</span>;
}

function EventPanel({ scene }: { scene: SpatialScene }) {
  const source = scene.objects.find((object) => object.id === "bookcase")?.dimensions.widthProvenance;
  return (
    <section className="event-panel" aria-labelledby="event-title">
      <h4 id="event-title">Recorded session event</h4>
      <dl>
        <div><dt>Value</dt><dd>1,000 → 1,000 mm · unchanged</dd></div>
        <div><dt>Source</dt><dd>Visual estimate → homeowner tape measurement</dd></div>
        <div><dt>Authority</dt><dd>Observed-unverified → user-declared</dd></div>
        <div><dt>Event</dt><dd><code>{source?.sourceEventId}</code></dd></div>
      </dl>
    </section>
  );
}

type ProofRow = { label: string; digest?: ProjectionDigest };
function ProofPanel({ proof, pending, failed }: { proof?: AuthorityProof; pending: boolean; failed: boolean }) {
  const rows: ProofRow[] = [
    { label: "Geometry · Pass A input", digest: proof?.geometry.before },
    { label: "Geometry · Pass B input", digest: proof?.geometry.after },
    { label: "Transaction · Pass A", digest: proof?.transaction.before },
    { label: "Transaction · Pass B", digest: proof?.transaction.after },
    { label: "Authority · Pass A", digest: proof?.authority.before },
    { label: "Authority · Pass B", digest: proof?.authority.after },
  ];
  const rowState = failed ? "Error" : proof ? "Hashed" : "Pending";
  return (
    <section className={`proof-panel ${proof?.valid ? "proof-valid" : failed ? "proof-invalid" : ""}`} aria-labelledby="digest-title">
      <div className="section-heading"><span>03</span><div><p>Browser SHA-256</p><h2 id="digest-title">Six canonical proof rows</h2></div></div>
      <p className="proof-intro">UTF-8 sorted canonical JSON · integer millimetres · browser proof boundary</p>
      <div className="digest-rows">{rows.map((row) => <div className="digest-row" key={row.label}><span>{row.label}</span><strong data-state={rowState.toLowerCase()}>{rowState}</strong><code>{row.digest ? row.digest.hash.slice("sha256:".length, "sha256:".length + 12) : pending ? "Hashing…" : failed ? "Unavailable" : "Awaiting authority event"}</code><CopyDigest digest={row.digest?.hash} label={row.label} /></div>)}</div>
      <div className="relationships" aria-label="Proof relationship summaries">
        <div><span>Geometry</span><strong>{proof ? (proof.geometry.equal ? "MATCH" : "MISMATCH") : "PENDING"}</strong></div>
        <div><span>Transaction</span><strong>{proof ? (proof.transaction.equal ? "MATCH" : "MISMATCH") : "PENDING"}</strong></div>
        <div><span>Authority</span><strong>{proof ? (proof.valid ? "1 FIELD" : "MISMATCH") : "PENDING"}</strong></div>
      </div>
      {proof?.valid ? <p className="proof-conclusion"><Check aria-hidden="true" size={17} />Only evidence authority changed.</p> : null}
    </section>
  );
}

function CopyDigest({ digest, label }: { digest?: string; label: string }) {
  return <button type="button" className="copy-button" disabled={!digest} onClick={() => digest && navigator.clipboard?.writeText(digest)} aria-label={`Copy full digest for ${label}`}><Copy aria-hidden="true" size={16} />Copy</button>;
}

function Receipt({ receipt }: { receipt: BasicReceipt }) {
  const proofRows = [
    ["Geometry · Pass A input", receipt.proof.geometryBefore],
    ["Geometry · Pass B input", receipt.proof.geometryAfterAuthorityEvent],
    ["Transaction · Pass A", receipt.proof.transactionBefore],
    ["Transaction · Pass B", receipt.proof.transactionAfterAuthorityEvent],
    ["Authority · Pass A", receipt.proof.authorityBefore],
    ["Authority · Pass B", receipt.proof.authorityAfter],
  ] as const;
  return (
    <section className="receipt" aria-labelledby="receipt-title">
      <h4 id="receipt-title">Decision receipt</h4>
      <dl className="receipt-summary">
        <div><dt>Version / time</dt><dd>{receipt.versionId}<br /><time dateTime={receipt.createdAt}>{receipt.createdAt} · {receipt.timeZone}</time></dd></div>
        <div><dt>Requested</dt><dd>+{receipt.requestedDeltaMm} mm</dd></div>
        <div><dt>Committed</dt><dd>+{receipt.committedDeltaMm} mm</dd></div>
        <div><dt>Outcome</dt><dd>{receipt.decision}</dd></div>
        <div><dt>Policy</dt><dd><code>{receipt.policyRef.id}@{receipt.policyRef.version}</code><code className="full-hash">{receipt.policyRef.hash}</code></dd></div>
        <div><dt>Provider</dt><dd>{receipt.provider.mode === "gpt-5.6-terra" ? `${receipt.provider.model} · response ${receipt.provider.requestId}` : "Prepared fallback · no model request"}</dd></div>
        <div><dt>Session attestation</dt><dd>{receipt.sessionAttestation.statement}<br /><code>{receipt.sessionAttestation.eventId}</code><br /><time dateTime={receipt.sessionAttestation.recordedAt}>{receipt.sessionAttestation.recordedAt}</time></dd></div>
      </dl>
      <h5>Five authorizing bases</h5>
      <ol className="receipt-bases">{receipt.factBases.map((fact) => <li key={fact.factId}><code>{fact.factId}</code><span>{fact.valueMm.toLocaleString("en-US")} mm · {fact.authority}</span><span>{fact.basis} · {fact.sourceLabel}</span><code>{fact.sourceEventId ?? fact.sourceRef}</code></li>)}</ol>
      <h5>Six full proof hashes</h5>
      <div className="receipt-hashes">{proofRows.map(([label, digest]) => <div key={label}><span>{label}</span><code>{digest.hash}</code><CopyDigest digest={digest.hash} label={`receipt ${label}`} /></div>)}</div>
      <h5>Relationship summaries</h5>
      <p className="receipt-relationships">Geometry {receipt.relationships.geometry} · Transaction {receipt.relationships.transaction} · Authority {receipt.relationships.authority}</p>
      <h5>Professional review</h5>
      <p><strong>{receipt.professionalReview.status}</strong> · {receipt.professionalReview.reason}</p>
      <h5>Checked scene diff</h5>
      <p><code>{receipt.sceneDiff[0].entityId}.{receipt.sceneDiff[0].field}</code> {receipt.sceneDiff[0].before} → {receipt.sceneDiff[0].after} mm</p>
      <p className="receipt-limitation">{receipt.limitation}</p>
    </section>
  );
}

function DecisionState({ kicker, title, body, icon, className = "", children, headingRef }: { kicker: string; title: string; body: string; icon?: React.ReactNode; className?: string; children: React.ReactNode; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return <section className={`decision-state ${className}`}><p className="state-kicker">{icon}{kicker}</p><h2 ref={headingRef} tabIndex={-1}>{title}</h2><p>{body}</p>{children}</section>;
}

function ActionButton({ onClick, children, disabled = false }: { onClick: () => void | Promise<void>; children: React.ReactNode; disabled?: boolean }) {
  return <button className="primary-button" type="button" onClick={onClick} disabled={disabled}>{children}<ArrowRight aria-hidden="true" size={17} /></button>;
}
