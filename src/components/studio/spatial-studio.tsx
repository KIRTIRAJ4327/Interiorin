"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleAlert, LockKeyhole, RotateCcw, Ruler, Sparkles } from "lucide-react";
import {
  preparedProposalFallback,
  proposalToSceneAction,
  type ProposalEnvelope,
  type ProposalProviderMode,
} from "@/lib/ai/proposal";
import { declareObjectWidthForSession } from "@/lib/spatial/fact-authority";
import { clonePreparedScene } from "@/lib/spatial/prepared-scenes";
import { buildAuthorityProof, type AuthorityProof } from "@/lib/spatial/proof";
import type { SceneAction, SpatialScene } from "@/lib/spatial/schema";
import { buildBasicReceipt, type BasicReceipt } from "@/lib/spatial/receipt";
import { commitTruthContractOutcome } from "@/lib/spatial/transaction";
import { evaluateTruthContract, type TruthContractOutcome } from "@/lib/spatial/truth-contract";
import { SceneCanvas } from "./scene-canvas";

const demoRequest = "Move the dining table 40 cm toward the bookcase. Keep the 90 cm path and do not touch the heirloom bookcase.";
const demoAction: SceneAction = { type: "move_object", objectId: "table", position: { x: 1.32, y: 0, z: 0 } };
type Stage = "ready" | "evidence_required" | "evidence_recorded" | "limited" | "committed";

const authorityLabel = {
  verified: "Verified",
  user_declared: "User declared",
  observed_unverified: "Observed · unverified",
  inferred: "Inferred",
  generated: "Generated",
};

export function SpatialStudio() {
  const [scene, setScene] = useState<SpatialScene>(() => clonePreparedScene("interior"));
  const [stage, setStage] = useState<Stage>("ready");
  const [outcome, setOutcome] = useState<TruthContractOutcome>();
  const [receipt, setReceipt] = useState<BasicReceipt>();
  const [providerMode, setProviderMode] = useState<ProposalProviderMode>();
  const [providerModel, setProviderModel] = useState<string>();
  const [providerRequestId, setProviderRequestId] = useState<string>();
  const [providerDisclosure, setProviderDisclosure] = useState("Intent has not been sent to a model.");
  const [isClarifying, setIsClarifying] = useState(false);
  const [proof, setProof] = useState<AuthorityProof>();
  const [forceOffline, setForceOffline] = useState(false);
  const [frozenAction, setFrozenAction] = useState<SceneAction>();
  const bookcase = scene.objects.find((object) => object.id === "bookcase");
  const previewPosition = outcome?.decision === "limited" && outcome.effectiveAction?.type === "move_object"
    ? outcome.effectiveAction.position
    : undefined;
  const requestedCentimeters =
    frozenAction?.type === "move_object"
      ? Math.round((frozenAction.position.x - 0.92) * 100)
      : 40;

  async function runCheck() {
    setIsClarifying(true);
    let action = demoAction;
    if (forceOffline) {
      const prepared = preparedProposalFallback(demoRequest);
      setProviderMode("prepared_fallback");
      setProviderDisclosure("Presenter selected offline deterministic parser; no model call was attempted.");
      if (prepared.status === "resolved") action = proposalToSceneAction(scene, prepared);
      setFrozenAction(action);
      const next = evaluateTruthContract(scene, action);
      setOutcome(next);
      setStage(next.decision === "confirmation_required" ? "evidence_required" : "limited");
      setIsClarifying(false);
      return;
    }
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: demoRequest }),
      });
      if (!response.ok) throw new Error("Proposal endpoint rejected the request");
      const envelope = (await response.json()) as ProposalEnvelope;
      setProviderMode(envelope.mode);
      setProviderModel(envelope.model);
      setProviderRequestId(envelope.requestId);
      setProviderDisclosure(envelope.disclosure);
      if (envelope.result.status === "needs_clarification") {
        setProviderDisclosure(envelope.result.question);
        setIsClarifying(false);
        return;
      }
      action = proposalToSceneAction(scene, envelope.result);
    } catch {
      const prepared = preparedProposalFallback(demoRequest);
      setProviderMode("prepared_fallback");
      setProviderDisclosure("Proposal endpoint unavailable; prepared deterministic clarification is active.");
      if (prepared.status === "resolved") action = proposalToSceneAction(scene, prepared);
    }

    setFrozenAction(action);
    const next = evaluateTruthContract(scene, action);
    setOutcome(next);
    setStage(next.decision === "confirmation_required" ? "evidence_required" : "limited");
    setIsClarifying(false);
  }

  async function recordMeasurement() {
    if (!frozenAction) return;
    const declaredScene = declareObjectWidthForSession(scene, "bookcase", {
      width: 1,
      sourceLabel: "Tape measurement entered in session",
    });
    const nextProof = await buildAuthorityProof(
      scene,
      declaredScene,
      frozenAction,
      frozenAction,
    );
    setProof(nextProof);
    if (!nextProof.valid) return;
    setScene(declaredScene);
    setStage("evidence_recorded");
  }

  function rerunSameCheck() {
    if (!frozenAction) return;
    const next = evaluateTruthContract(scene, frozenAction);
    setOutcome(next);
    setStage(next.decision === "limited" ? "limited" : "evidence_required");
  }

  async function acceptAlternative() {
    if (!outcome || !proof) return;
    const committed = commitTruthContractOutcome(scene, outcome);
    const decisionReceipt = await buildBasicReceipt(
      scene,
      committed.scene,
      outcome,
      proof,
      {
        mode: providerMode ?? "prepared_fallback",
        model: providerModel,
        requestId: providerRequestId,
        disclosure: providerDisclosure,
      },
    );
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
    setProviderDisclosure("Intent has not been sent to a model.");
    setIsClarifying(false);
    setProof(undefined);
    setForceOffline(false);
    setFrozenAction(undefined);
    setStage("ready");
  }

  return (
    <main className="studio-shell">
      <a className="skip-link" href="#decision-panel">Skip to decision panel</a>
      <header className="studio-header">
        <div className="brand-lockup"><span className="wordmark">Interiorin</span><span className="workspace-title">Authority gate / Dining room 01</span></div>
        <div className="scene-status"><span className="status-dot" aria-hidden="true" />Calibrated baseline · 7.0 m north wall</div>
        <button className="quiet-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" size={16} /> Reset proof</button>
      </header>

      <div className="studio-grid">
        <aside className="truth-rail" aria-labelledby="truth-ledger-title">
          <PanelHeading index="01" eyebrow="Scene facts" title="Authority ledger" id="truth-ledger-title" />
          <p className="rail-intro">Geometry is visible. Authority decides whether it may support a fit claim.</p>
          <div className="fact-list">
            <Fact icon={<Ruler aria-hidden="true" size={17} />} title="90 cm access path" detail="Exact session constraint" authority="User declared" state="user_declared" />
            <Fact icon={<LockKeyhole aria-hidden="true" size={17} />} title="Bookcase width" detail={`${(bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance)?.authority === "user_declared" ? "Homeowner attested" : "Visual estimate"} · 1.00 m`} authority={bookcase ? authorityLabel[(bookcase.dimensions.widthProvenance ?? bookcase.dimensions.provenance).authority] : "Unknown"} state={(bookcase?.dimensions.widthProvenance ?? bookcase?.dimensions.provenance)?.authority} />
            <Fact icon={<Check aria-hidden="true" size={17} />} title="Bookcase lock" detail="Retain and protect" authority="User declared" state="user_declared" />
          </div>
          <div className="authority-rule"><p>AUTHORITY RULE 01</p><strong>Unverified facts may block. They never authorize fit.</strong></div>
          <div className="policy-note"><span>DEMO POLICY · V1.0.0 · UNENDORSED</span><p>Early decision support only—not survey, code, structural, or construction certification.</p></div>
        </aside>

        <section className="scene-stage" aria-labelledby="scene-title">
          <div className="scene-toolbar">
            <div><p>Canonical scene</p><h2 id="scene-title">Measured dining room</h2></div>
            <div className="legend" aria-label="Scene legend"><span><i className="legend-current" /> Current</span><span><i className="legend-preview" /> Checked alternative</span></div>
          </div>
          <SceneCanvas scene={scene} previewPosition={previewPosition} />
          <div className="scene-metrics"><span>Requested <strong>+{requestedCentimeters} cm</strong></span><span>Authorized alternative <strong>{outcome?.decision === "limited" ? "+18 cm" : "—"}</strong></span><span>Committed <strong>{stage === "committed" ? "+18 cm" : "0 cm"}</strong></span></div>
        </section>

        <aside className="decision-panel" id="decision-panel" aria-labelledby="decision-title">
          <PanelHeading index="02" eyebrow="Pre-commit check" title="Decision trace" id="decision-title" />
          <div className="proposal-card">
            <div className="proposal-source"><Sparkles aria-hidden="true" size={15} />{providerMode === "gpt-5.6" ? "GPT-5.6 typed proposal" : providerMode === "prepared_fallback" ? "Prepared typed proposal" : "Proposal awaiting check"}</div>
            <p>{demoRequest}</p><code>move(table_01, x: +{(requestedCentimeters / 100).toFixed(2)}m)</code><small>{providerDisclosure}</small>
            <button className="mode-toggle" type="button" role="switch" aria-checked={forceOffline} onClick={() => setForceOffline((current) => !current)}><span aria-hidden="true" />Offline proof mode {forceOffline ? "on" : "off"}</button>
          </div>

          {stage === "ready" ? <DecisionState kicker="READY TO CHECK" title="No scene mutation has been attempted." body="Clarify the request, then run the exact proposal against every supporting fact and constraint."><ActionButton onClick={runCheck} disabled={isClarifying}>{isClarifying ? "Clarifying request…" : "Clarify and check"}</ActionButton></DecisionState> : null}

          {stage === "evidence_required" ? <DecisionState className="warning-state" kicker="CONFIRMATION REQUIRED" title="Geometry is computable. Authority is not." body="The bookcase bounds came from one image. Enter one measurement before Interiorin exposes an actionable fit." icon={<CircleAlert aria-hidden="true" size={15} />}>
            <div className="measurement-row"><label htmlFor="bookcase-width">Bookcase width</label><div><input id="bookcase-width" value="100" readOnly inputMode="decimal" /><span>cm</span></div></div>
            <ActionButton onClick={recordMeasurement}>Record measurement</ActionButton>
          </DecisionState> : null}

          {stage === "evidence_recorded" ? <DecisionState className="verified-state" kicker="EVIDENCE RECORDED" title="Only authority changed." body="The coordinate, constraint, lock, and request are unchanged. Rerun the same check." icon={<Check aria-hidden="true" size={15} />}><ActionButton onClick={rerunSameCheck}>Rerun unchanged proposal</ActionButton></DecisionState> : null}

          {stage === "limited" ? <DecisionState className="limited-state" kicker="LIMITED · CHECKED ALTERNATIVE" title={`${requestedCentimeters} cm fails. 18 cm passes.`} body="The terracotta ghost shows the nearest position that preserves the entered path and protected bound.">
            <ul className="check-list"><li><Check aria-hidden="true" size={14} />90 cm path retained</li><li><Check aria-hidden="true" size={14} />Bookcase untouched</li><li><CircleAlert aria-hidden="true" size={14} />Professional review attached</li></ul>
            <ActionButton onClick={acceptAlternative}>Accept 18 cm alternative</ActionButton>
          </DecisionState> : null}

          {stage === "committed" && receipt ? <DecisionState className="receipt-state" kicker="COMMITTED WITH RECEIPT" title="The checked alternative is now canonical." body="Requested and committed actions remain distinct in the record." icon={<Check aria-hidden="true" size={15} />}>
            <dl><div><dt>Requested</dt><dd>+{requestedCentimeters} cm</dd></div><div><dt>Committed</dt><dd>+18 cm</dd></div><div><dt>Fact bases</dt><dd>{receipt.factBases.length} / 5</dd></div><div><dt>Review</dt><dd>{receipt.professionalReview.required ? receipt.professionalReview.status : "not required"}</dd></div><div><dt>Provider</dt><dd>{receipt.provider.mode === "gpt-5.6" ? "live Terra" : "offline"}</dd></div><div><dt>Policy</dt><dd>{receipt.policyRef.version}</dd></div></dl>
            <p className="receipt-id">Receipt {receipt.id.slice(0, 8)}</p>
          </DecisionState> : null}
          {proof ? <ProofPanel proof={proof} /> : null}
        </aside>
      </div>
    </main>
  );
}

function PanelHeading({ index, eyebrow, title, id }: { index: string; eyebrow: string; title: string; id: string }) {
  return <div className="panel-heading"><span>{index}</span><div><p>{eyebrow}</p><h1 id={id}>{title}</h1></div></div>;
}

function Fact({ icon, title, detail, authority, state }: { icon: React.ReactNode; title: string; detail: string; authority: string; state?: string }) {
  return <article className="fact-row">{icon}<div><h2>{title}</h2><p>{detail}</p></div><span data-authority={state}>{authority}</span></article>;
}

function DecisionState({ kicker, title, body, icon, className = "", children }: { kicker: string; title: string; body: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return <div className={`decision-state ${className}`} role="status"><p className="state-kicker">{icon}{kicker}</p><h3>{title}</h3><p>{body}</p>{children}</div>;
}

function ActionButton({ onClick, children, disabled = false }: { onClick: () => void | Promise<void>; children: React.ReactNode; disabled?: boolean }) {
  return <button className="primary-button" type="button" onClick={onClick} disabled={disabled}>{children}<ArrowRight aria-hidden="true" size={17} /></button>;
}

function ProofPanel({ proof }: { proof: AuthorityProof }) {
  const shortHash = (hash: string) => `${hash.slice(0, 15)}…${hash.slice(-8)}`;
  return (
    <section className={`proof-panel ${proof.valid ? "proof-valid" : "proof-invalid"}`} aria-labelledby="proof-title">
      <p className="state-kicker">A/B CAUSAL PROOF</p>
      <h3 id="proof-title">{proof.valid ? "Only evidence authority changed." : "Proof invalid — pass B disabled."}</h3>
      <div className="proof-rows">
        <div><span>Geometry bytes</span><strong>{proof.geometry.equal ? "MATCH" : "CHANGED"}</strong><code>{shortHash(proof.geometry.before.hash)}</code></div>
        <div><span>Transaction bytes</span><strong>{proof.transaction.equal ? "MATCH" : "CHANGED"}</strong><code>{shortHash(proof.transaction.before.hash)}</code></div>
        <div><span>Authority ledger</span><strong>{proof.authority.equal ? "MATCH" : "1 FIELD"}</strong><code>{proof.authority.diff[0] ? `${proof.authority.diff[0].before} → ${proof.authority.diff[0].after}` : "No allowed diff"}</code></div>
      </div>
    </section>
  );
}
