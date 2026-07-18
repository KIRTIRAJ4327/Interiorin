"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleAlert, LockKeyhole, RotateCcw, Ruler, Sparkles } from "lucide-react";
import {
  preparedProposalFallback,
  proposalToSceneAction,
  type ProposalEnvelope,
  type ProposalProviderMode,
} from "@/lib/ai/proposal";
import { recordVerifiedObjectDimensions } from "@/lib/spatial/fact-authority";
import { clonePreparedScene } from "@/lib/spatial/prepared-scenes";
import type { SceneAction, SpatialScene } from "@/lib/spatial/schema";
import { commitTruthContractOutcome, type SpatialCommitReceipt } from "@/lib/spatial/transaction";
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
  const [receipt, setReceipt] = useState<SpatialCommitReceipt>();
  const [providerMode, setProviderMode] = useState<ProposalProviderMode>();
  const [providerDisclosure, setProviderDisclosure] = useState("Intent has not been sent to a model.");
  const [isClarifying, setIsClarifying] = useState(false);
  const bookcase = scene.objects.find((object) => object.id === "bookcase");
  const previewPosition = outcome?.decision === "limited" && outcome.effectiveAction?.type === "move_object"
    ? outcome.effectiveAction.position
    : undefined;

  async function runCheck() {
    setIsClarifying(true);
    let action = demoAction;
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: demoRequest }),
      });
      if (!response.ok) throw new Error("Proposal endpoint rejected the request");
      const envelope = (await response.json()) as ProposalEnvelope;
      setProviderMode(envelope.mode);
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

    const next = evaluateTruthContract(scene, action);
    setOutcome(next);
    setStage(next.decision === "confirmation_required" ? "evidence_required" : "limited");
    setIsClarifying(false);
  }

  function recordMeasurement() {
    setScene(recordVerifiedObjectDimensions(scene, "bookcase", {
      width: 1,
      height: 2,
      depth: 0.4,
      sourceLabel: "Tape measurement entered in session",
    }));
    setStage("evidence_recorded");
  }

  function rerunSameCheck() {
    const next = evaluateTruthContract(scene, demoAction);
    setOutcome(next);
    setStage(next.decision === "limited" ? "limited" : "evidence_required");
  }

  function acceptAlternative() {
    if (!outcome) return;
    const committed = commitTruthContractOutcome(scene, outcome);
    setScene(committed.scene);
    setReceipt(committed.receipt);
    setStage("committed");
  }

  function reset() {
    setScene(clonePreparedScene("interior"));
    setOutcome(undefined);
    setReceipt(undefined);
    setProviderMode(undefined);
    setProviderDisclosure("Intent has not been sent to a model.");
    setIsClarifying(false);
    setStage("ready");
  }

  return (
    <main className="studio-shell">
      <a className="skip-link" href="#decision-panel">Skip to decision panel</a>
      <header className="studio-header">
        <div className="brand-lockup"><span className="wordmark">Interiorin</span><span className="workspace-title">Groundline / Dining room 01</span></div>
        <div className="scene-status"><span className="status-dot" aria-hidden="true" />Calibrated baseline · 6.0 m north wall</div>
        <button className="quiet-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" size={16} /> Reset proof</button>
      </header>

      <div className="studio-grid">
        <aside className="truth-rail" aria-labelledby="truth-ledger-title">
          <PanelHeading index="01" eyebrow="Scene facts" title="Authority ledger" id="truth-ledger-title" />
          <p className="rail-intro">Geometry is visible. Authority decides whether it may support a fit claim.</p>
          <div className="fact-list">
            <Fact icon={<Ruler aria-hidden="true" size={17} />} title="90 cm access path" detail="Exact session constraint" authority="User declared" state="user_declared" />
            <Fact icon={<LockKeyhole aria-hidden="true" size={17} />} title="Heirloom bookcase" detail="1.00 × 2.00 × 0.40 m" authority={bookcase ? authorityLabel[bookcase.dimensions.provenance.authority] : "Unknown"} state={bookcase?.dimensions.provenance.authority} />
            <Fact icon={<Check aria-hidden="true" size={17} />} title="Bookcase lock" detail="Retain and protect" authority="User declared" state="user_declared" />
          </div>
          <div className="authority-rule"><p>AUTHORITY RULE 01</p><strong>Unverified facts may block. They never authorize fit.</strong></div>
        </aside>

        <section className="scene-stage" aria-labelledby="scene-title">
          <div className="scene-toolbar">
            <div><p>Canonical scene</p><h2 id="scene-title">Measured dining room</h2></div>
            <div className="legend" aria-label="Scene legend"><span><i className="legend-current" /> Current</span><span><i className="legend-preview" /> Checked alternative</span></div>
          </div>
          <SceneCanvas scene={scene} previewPosition={previewPosition} />
          <div className="scene-metrics"><span>Requested <strong>+40 cm</strong></span><span>Authorized alternative <strong>{outcome?.decision === "limited" ? "+18 cm" : "—"}</strong></span><span>Committed <strong>{stage === "committed" ? "+18 cm" : "0 cm"}</strong></span></div>
        </section>

        <aside className="decision-panel" id="decision-panel" aria-labelledby="decision-title">
          <PanelHeading index="02" eyebrow="Pre-commit check" title="Decision trace" id="decision-title" />
          <div className="proposal-card">
            <div className="proposal-source"><Sparkles aria-hidden="true" size={15} />{providerMode === "gpt-5.6" ? "GPT-5.6 typed proposal" : providerMode === "prepared_fallback" ? "Prepared typed proposal" : "Proposal awaiting check"}</div>
            <p>{demoRequest}</p><code>move(table_01, x: +0.40m)</code><small>{providerDisclosure}</small>
          </div>

          {stage === "ready" ? <DecisionState kicker="READY TO CHECK" title="No scene mutation has been attempted." body="Clarify the request, then run the exact proposal against every supporting fact and constraint."><ActionButton onClick={runCheck} disabled={isClarifying}>{isClarifying ? "Clarifying request…" : "Clarify and check"}</ActionButton></DecisionState> : null}

          {stage === "evidence_required" ? <DecisionState className="warning-state" kicker="CONFIRMATION REQUIRED" title="Geometry is computable. Authority is not." body="The bookcase bounds came from one image. Enter one measurement before Groundline exposes an actionable fit." icon={<CircleAlert aria-hidden="true" size={15} />}>
            <div className="measurement-row"><label htmlFor="bookcase-depth">Bookcase depth</label><div><input id="bookcase-depth" value="40" readOnly inputMode="decimal" /><span>cm</span></div></div>
            <ActionButton onClick={recordMeasurement}>Record measurement</ActionButton>
          </DecisionState> : null}

          {stage === "evidence_recorded" ? <DecisionState className="verified-state" kicker="EVIDENCE RECORDED" title="Only authority changed." body="The coordinate, constraint, lock, and request are unchanged. Rerun the same check." icon={<Check aria-hidden="true" size={15} />}><ActionButton onClick={rerunSameCheck}>Rerun unchanged proposal</ActionButton></DecisionState> : null}

          {stage === "limited" ? <DecisionState className="limited-state" kicker="LIMITED · CHECKED ALTERNATIVE" title="40 cm fails. 18 cm passes." body="The terracotta ghost shows the nearest position that preserves the entered path and protected bound.">
            <ul className="check-list"><li><Check aria-hidden="true" size={14} />90 cm path retained</li><li><Check aria-hidden="true" size={14} />Bookcase untouched</li><li><CircleAlert aria-hidden="true" size={14} />Professional review attached</li></ul>
            <ActionButton onClick={acceptAlternative}>Accept 18 cm alternative</ActionButton>
          </DecisionState> : null}

          {stage === "committed" && receipt ? <DecisionState className="receipt-state" kicker="COMMITTED WITH RECEIPT" title="The checked alternative is now canonical." body="Requested and committed actions remain distinct in the record." icon={<Check aria-hidden="true" size={15} />}>
            <dl><div><dt>Requested</dt><dd>+40 cm</dd></div><div><dt>Committed</dt><dd>+18 cm</dd></div><div><dt>Decision</dt><dd>{receipt.decision}</dd></div><div><dt>Review queue</dt><dd>{receipt.professionalReviewFlagIds.length} item</dd></div></dl>
            <p className="receipt-id">Receipt {receipt.id.slice(0, 8)}</p>
          </DecisionState> : null}
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
