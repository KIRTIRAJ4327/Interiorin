"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Download,
  FileText,
  GitCompareArrows,
  History,
  House,
  Landmark,
  Layers3,
  Mic,
  MicOff,
  Move3d,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Square,
  Trees,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { compareScenes } from "@/lib/spatial/diff";
import type { SpatialScene } from "@/lib/spatial/schema";
import { validateScene } from "@/lib/spatial/validation";
import { spaceAnalysisEnvelopeSchema, type SpaceAnalysisEnvelope } from "@/lib/studio/analysis";
import { conceptRenderEnvelopeSchema, type ConceptRenderEnvelope } from "@/lib/studio/presentation";
import { generateStudioOptions } from "@/lib/studio/generator";
import { applyStudioRefinement, parseStudioRefinement, type ParsedRefinement } from "@/lib/studio/refinement";
import { studioProjectSchema, studioVersionSchema, type StudioOption, type StudioProject, type StudioVersion } from "@/lib/studio/schema";
import { readStoredVersions, writeStoredVersions } from "@/lib/studio/storage";
import { StudioModel } from "./studio-model";

type StudioReceipt = {
  id: string;
  transcript: string;
  summary: string;
  status: "accepted" | "rejected";
  warnings: string[];
  createdAt: string;
};

type SpeechRecognitionResultLike = { 0: { transcript: string } };
type SpeechRecognitionEventLike = { results: { 0: SpeechRecognitionResultLike } };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const defaultForm = {
  name: "My living space",
  kind: "interior" as "interior" | "exterior",
  condition: "existing" as "empty" | "existing",
  intent: "Create a calm, flexible place for everyday use and small gatherings.",
  widthM: "5.2",
  depthM: "4.0",
  heightM: "2.7",
};

export function InteriorinStudio() {
  const [form, setForm] = useState(defaultForm);
  const [sourceFile, setSourceFile] = useState<File>();
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState("");
  const [analysisEnvelope, setAnalysisEnvelope] = useState<SpaceAnalysisEnvelope>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conceptRender, setConceptRender] = useState<ConceptRenderEnvelope>();
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  const [formError, setFormError] = useState("");
  const [project, setProject] = useState<StudioProject>();
  const [options, setOptions] = useState<StudioOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [scene, setScene] = useState<SpatialScene>();
  const [sceneHistory, setSceneHistory] = useState<SpatialScene[]>([]);
  const [command, setCommand] = useState("Move the table right 30 cm");
  const [parsedRefinement, setParsedRefinement] = useState<ParsedRefinement>();
  const [receipts, setReceipts] = useState<StudioReceipt[]>([]);
  const [versions, setVersions] = useState<StudioVersion[]>([]);
  const [versionName, setVersionName] = useState("First direction");
  const [firstCompareId, setFirstCompareId] = useState("");
  const [secondCompareId, setSecondCompareId] = useState("");
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "unavailable" | "error">("idle");
  const [handoffScope, setHandoffScope] = useState("Furniture layout and spatial planning review");
  const [openQuestions, setOpenQuestions] = useState("Confirm openings, services, exact retained-object dimensions, and all site conditions before procurement or construction.");
  const [isPending, startTransition] = useTransition();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sourcePreviewRef = useRef("");
  const optionHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = readStoredVersions(window.localStorage);
      setVersions(stored);
      if (stored[0]) setFirstCompareId(stored[0].id);
      if (stored[1]) setSecondCompareId(stored[1].id);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if (sourcePreviewRef.current) URL.revokeObjectURL(sourcePreviewRef.current);
  }, []);

  const selectedOption = options.find((option) => option.id === selectedOptionId);
  const sceneValidation = useMemo(() => scene ? validateScene(scene) : undefined, [scene]);
  const optionValidation = useMemo(() => new Map(options.map((option) => [option.id, validateScene(option.scene).status])), [options]);
  const projectVersions = versions.filter((version) => version.projectId === project?.id);
  const comparison = useMemo(() => {
    const first = versions.find((version) => version.id === firstCompareId);
    const second = versions.find((version) => version.id === secondCompareId);
    if (!first || !second || first.id === second.id) return undefined;
    return { first, second, diff: compareScenes(first.scene, second.scene) };
  }, [firstCompareId, secondCompareId, versions]);

  function chooseSource(file?: File) {
    if (sourcePreviewRef.current) URL.revokeObjectURL(sourcePreviewRef.current);
    const preview = file?.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    sourcePreviewRef.current = preview;
    setSourcePreviewUrl(preview);
    setSourceFile(file);
    setAnalysisEnvelope(undefined);
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (sourceFile && sourceFile.size > 15 * 1024 * 1024) {
      setFormError("Visual sources must be 15 MB or smaller.");
      return;
    }
    let sourceAnalysis: SpaceAnalysisEnvelope | undefined;
    if (sourceFile) {
      setIsAnalyzing(true);
      const body = new FormData();
      body.set("source", sourceFile);
      body.set("kind", form.kind);
      body.set("condition", form.condition);
      body.set("intent", form.intent);
      try {
        const response = await fetch("/api/space-analysis", { method: "POST", body });
        const parsedEnvelope = spaceAnalysisEnvelopeSchema.safeParse(await response.json().catch(() => null));
        sourceAnalysis = parsedEnvelope.success ? parsedEnvelope.data : {
          status: "analysis_failed",
          disclosure: "The source-analysis response was malformed. Entered dimensions remain usable.",
        };
      } catch {
        sourceAnalysis = { status: "analysis_failed", disclosure: "Visual analysis could not be reached. Entered dimensions remain usable." };
      } finally {
        setIsAnalyzing(false);
      }
      setAnalysisEnvelope(sourceAnalysis);
    }

    const now = new Date().toISOString();
    const parsed = studioProjectSchema.safeParse({
      id: `project-${crypto.randomUUID()}`,
      name: form.name,
      kind: form.kind,
      condition: form.condition,
      intent: form.intent,
      dimensions: { widthM: Number(form.widthM), depthM: Number(form.depthM), heightM: Number(form.heightM) },
      source: {
        mode: sourceFile ? "photo_with_measurements" : "guided_measurements",
        fileName: sourceFile?.name,
        fileSize: sourceFile?.size,
        authority: "user_declared",
        analysis: sourceAnalysis?.status === "analyzed" ? sourceAnalysis.analysis : undefined,
        analysisDisclosure: sourceAnalysis?.disclosure,
        analysisModel: sourceAnalysis?.model,
        analysisRequestId: sourceAnalysis?.requestId,
      },
      createdAt: now,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the project details and entered dimensions.");
      return;
    }
    startTransition(() => {
      const nextOptions = generateStudioOptions(parsed.data);
      const firstOption = nextOptions[0];
      if (!firstOption) return;
      setProject(parsed.data);
      setOptions(nextOptions);
      setSelectedOptionId(firstOption.id);
      setScene(structuredClone(firstOption.scene));
      setSceneHistory([]);
      setReceipts([]);
      setParsedRefinement(undefined);
      setConceptRender(undefined);
      requestAnimationFrame(() => optionHeadingRef.current?.focus());
    });
  }

  function selectOption(option: StudioOption) {
    setSelectedOptionId(option.id);
    setScene(structuredClone(option.scene));
    setSceneHistory([]);
    setParsedRefinement(undefined);
    setReceipts([]);
    setConceptRender(undefined);
  }

  function prepareRefinement() {
    if (!scene) return;
    setParsedRefinement(parseStudioRefinement(scene, command));
  }

  function applyRefinement() {
    if (!scene || parsedRefinement?.status !== "ready") return;
    if (parsedRefinement.action.type === "undo") {
      const previous = sceneHistory[0];
      const nextReceipt: StudioReceipt = {
        id: crypto.randomUUID(),
        transcript: command,
        summary: previous ? "Restored the previous committed canonical scene." : "Nothing has been committed to undo.",
        status: previous ? "accepted" : "rejected",
        warnings: [],
        createdAt: new Date().toISOString(),
      };
      if (previous) {
        setScene(structuredClone(previous));
        setSceneHistory((current) => current.slice(1));
      }
      setReceipts((current) => [nextReceipt, ...current]);
      setParsedRefinement(undefined);
      setConceptRender(undefined);
      return;
    }
    const result = applyStudioRefinement(scene, parsedRefinement);
    const nextReceipt: StudioReceipt = {
      id: result.receipt.id,
      transcript: command,
      summary: result.receipt.message,
      status: result.receipt.status,
      warnings: result.receipt.warnings,
      createdAt: result.receipt.createdAt,
    };
    if (result.receipt.status === "accepted") setSceneHistory((current) => [structuredClone(scene), ...current].slice(0, 20));
    setScene(result.scene);
    setReceipts((current) => [nextReceipt, ...current]);
    setParsedRefinement(undefined);
    setConceptRender(undefined);
  }

  async function generateConcept() {
    if (!sourceFile?.type.startsWith("image/") || !project || !selectedOption || !scene) return;
    setIsGeneratingConcept(true);
    const body = new FormData();
    body.set("source", sourceFile);
    body.set("brief", JSON.stringify({
      project: { name: project.name, kind: project.kind, intent: project.intent, enteredDimensionsM: project.dimensions },
      option: { name: selectedOption.name, principle: selectedOption.principle, rationale: selectedOption.rationale, tradeoffs: selectedOption.tradeoffs },
      visibleSourceAnalysis: project.source.analysis,
      canonicalScene: {
        openings: scene.openings.map((opening) => ({ label: opening.label, kind: opening.kind, protected: opening.protected })),
        objects: scene.objects.map((object) => ({ label: object.label, category: object.category, positionM: object.transform.position, dimensionsM: object.dimensions, materials: object.materialIds, protected: object.protected })),
        surfaces: scene.zones.map((zone) => ({ label: zone.label, material: zone.materialId, protected: zone.protected })),
      },
    }));
    try {
      const response = await fetch("/api/concept-render", { method: "POST", body });
      const parsed = conceptRenderEnvelopeSchema.safeParse(await response.json().catch(() => null));
      setConceptRender(parsed.success ? parsed.data : { status: "generation_failed", disclosure: "The concept-render response was malformed. No canonical state changed." });
    } catch {
      setConceptRender({ status: "generation_failed", disclosure: "The concept-render service could not be reached. No canonical state changed." });
    } finally {
      setIsGeneratingConcept(false);
    }
  }

  function startVoice() {
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceState("unavailable");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setCommand(event.results[0][0].transcript);
      setVoiceState("idle");
    };
    recognition.onerror = () => setVoiceState("error");
    recognition.onend = () => setVoiceState((current) => current === "listening" ? "idle" : current);
    recognitionRef.current = recognition;
    setVoiceState("listening");
    recognition.start();
  }

  function saveVersion() {
    if (!project || !scene || !selectedOption) return;
    const parsed = studioVersionSchema.safeParse({
      id: `version-${crypto.randomUUID()}`,
      projectId: project.id,
      optionId: selectedOption.id,
      name: versionName,
      scene,
      receipts,
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return;
    const next = [parsed.data, ...versions];
    setVersions(next);
    writeStoredVersions(window.localStorage, next);
    setFirstCompareId(parsed.data.id);
    if (!secondCompareId && versions[0]) setSecondCompareId(versions[0].id);
    setVersionName(`Version ${projectVersions.length + 2}`);
  }

  function resetProject() {
    setProject(undefined);
    setOptions([]);
    setSelectedOptionId("");
    setScene(undefined);
    setSceneHistory([]);
    setReceipts([]);
    setParsedRefinement(undefined);
    setFormError("");
    setAnalysisEnvelope(undefined);
    setConceptRender(undefined);
  }

  function downloadHandoff() {
    if (!project || projectVersions.length === 0) return;
    const payload = {
      schemaVersion: "interiorin.handoff/1",
      exportedAt: new Date().toISOString(),
      project,
      scope: handoffScope,
      openQuestions,
      versions: projectVersions,
      validation: projectVersions.map((version) => ({ versionId: version.id, versionName: version.name, ...validateScene(version.scene) })),
      limitations: [
        "Homeowner-entered dimensions and observed objects require field verification.",
        "This package is not survey, code, structural, drainage, utility, procurement, or construction certification.",
        "Generated options and 3D views support early decisions; professionals retain responsibility for their scope.",
      ],
      presentationConcept: conceptRender?.status === "generated" ? {
        model: conceptRender.model,
        requestId: conceptRender.requestId,
        createdAt: conceptRender.createdAt,
        disclosure: conceptRender.disclosure,
        imageIncluded: false,
      } : undefined,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-interiorin-handoff.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="product-shell" id="main-content">
      <a className="skip-link" href={project ? "#option-studio" : "#project-intake"}>Skip to studio content</a>
      <header className="product-header">
        <a className="product-brand" href="/studio"><span>Interiorin</span><small>Spatial decision studio</small></a>
        <nav aria-label="Primary studio navigation">
          <a href="#project-intake"><House aria-hidden="true" size={17} />Project</a>
          <a href="#option-studio" aria-disabled={!project}><Layers3 aria-hidden="true" size={17} />Options</a>
          <a href="#workbench" aria-disabled={!project}><Move3d aria-hidden="true" size={17} />Refine</a>
          <a href="#versions" aria-disabled={!project}><History aria-hidden="true" size={17} />Versions</a>
        </nav>
        <a className="proof-link" href="/proof/prepared-dining-room"><ShieldCheck aria-hidden="true" size={17} />Authority proof</a>
      </header>

      <section className="product-truth" aria-label="Product truth boundary">
        <span><Check aria-hidden="true" size={16} />Dimension-driven studio preview</span>
        <span>Source authority stays visible</span>
        <span>3D is decision support · not survey or certification</span>
      </section>

      <section className="project-intake" id="project-intake" aria-labelledby="project-title">
        <div className="project-intro">
          <p className="product-eyebrow">01 · show us the real space</p>
          <h1 id="project-title">Start with the space you have.</h1>
          <p>Enter one trustworthy envelope, optionally attach a reference, and get three materially different directions on the spot. Interiorin keeps what you entered separate from what it suggests.</p>
          <dl className="promise-ledger">
            <div><dt>Entered</dt><dd>Dimensions, space type, condition, intent</dd></div>
            <div><dt>Observed</dt><dd>Optional reference filename and suggested object roles</dd></div>
            <div><dt>Never inferred as fact</dt><dd>Structure, code, boundaries, utilities, drainage, procurement</dd></div>
          </dl>
        </div>

        <form className="project-form" onSubmit={generate} noValidate>
          <fieldset>
            <legend>Project</legend>
            <label>Project name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <div className="choice-row" role="group" aria-label="Space type">
              <button type="button" data-selected={form.kind === "interior"} onClick={() => setForm({ ...form, kind: "interior" })}><Square aria-hidden="true" size={18} />Interior</button>
              <button type="button" data-selected={form.kind === "exterior"} onClick={() => setForm({ ...form, kind: "exterior" })}><Trees aria-hidden="true" size={18} />Exterior</button>
            </div>
            <div className="choice-row" role="group" aria-label="Space condition">
              <button type="button" data-selected={form.condition === "existing"} onClick={() => setForm({ ...form, condition: "existing" })}>Existing space</button>
              <button type="button" data-selected={form.condition === "empty"} onClick={() => setForm({ ...form, condition: "empty" })}>Empty space</button>
            </div>
          </fieldset>
          <fieldset>
            <legend>Known envelope</legend>
            <div className="dimension-grid">
              <label>Width <span>metres</span><input type="number" min="2" max="40" step="0.1" inputMode="decimal" value={form.widthM} onChange={(event) => setForm({ ...form, widthM: event.target.value })} required /></label>
              <label>Depth <span>metres</span><input type="number" min="2" max="40" step="0.1" inputMode="decimal" value={form.depthM} onChange={(event) => setForm({ ...form, depthM: event.target.value })} required /></label>
              <label>{form.kind === "interior" ? "Height" : "Reference height"} <span>metres</span><input type="number" min="2" max="8" step="0.1" inputMode="decimal" value={form.heightM} onChange={(event) => setForm({ ...form, heightM: event.target.value })} required /></label>
            </div>
            <p className="field-help">These dimensions become user-declared model geometry. They are not a survey or legal boundary.</p>
          </fieldset>
          <fieldset>
            <legend>Intent and source</legend>
            <label>What should this space support?<textarea value={form.intent} onChange={(event) => setForm({ ...form, intent: event.target.value })} rows={3} required /></label>
            <label className="file-field"><FileText aria-hidden="true" size={19} /><span>Optional photo or plan reference<small>Images or PDF ≤15 MB · analyzed when Gemini is configured</small></span><input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => chooseSource(event.target.files?.[0])} /></label>
            {sourceFile ? <div className="source-selected">
              {sourcePreviewUrl ? <Image src={sourcePreviewUrl} alt="Selected space reference preview" width={240} height={150} unoptimized /> : <FileText aria-hidden="true" size={24} />}
              <p><Check aria-hidden="true" size={16} /><span><strong>{sourceFile.name}</strong>{(sourceFile.size / 1024 / 1024).toFixed(1)} MB · visual observations never become metric truth</span></p>
            </div> : null}
            {analysisEnvelope ? <AnalysisLedger envelope={analysisEnvelope} /> : sourceFile ? <p className="inline-note" role="status">The source will be analyzed before options are built. If the provider is unavailable, entered dimensions still generate the project.</p> : null}
          </fieldset>
          {formError ? <p className="form-error" role="alert"><CircleAlert aria-hidden="true" size={17} />{formError}</p> : null}
          <button className="product-primary" type="submit" disabled={isPending || isAnalyzing}>{isAnalyzing ? "Reading visible space cues…" : isPending ? "Building spatial options…" : "Generate three spatial directions"}<ArrowRight aria-hidden="true" size={18} /></button>
        </form>
      </section>

      {project && scene && selectedOption ? (
        <>
          <section className="option-studio" id="option-studio" aria-labelledby="option-title">
            <div className="section-folio">
              <p className="product-eyebrow">02 · instant reasoned directions</p>
              <h2 id="option-title" ref={optionHeadingRef} tabIndex={-1}>Three ways this space can work.</h2>
              <p>Each option uses the same entered envelope. The differences are explicit, reversible, and linked to a canonical scene—not a generated image.</p>
            </div>
            <div className="option-list" role="radiogroup" aria-label="Spatial design directions">
              {options.map((option, index) => (
                <button key={option.id} type="button" role="radio" aria-checked={option.id === selectedOptionId} className="reason-plate" onClick={() => selectOption(option)}>
                  <span className="option-number">0{index + 1}</span>
                  <span><small>{option.principle}</small><strong>{option.name}</strong><span>{option.rationale}</span><ValidationBadge status={optionValidation.get(option.id) ?? "review"} /></span>
                  <ChevronRight aria-hidden="true" size={20} />
                </button>
              ))}
            </div>
          </section>

          <section className="product-workbench" id="workbench" aria-labelledby="workbench-title">
            <div className="model-column">
              <div className="model-heading"><div><p className="product-eyebrow">03 · canonical workbench</p><h2 id="workbench-title">{selectedOption.name}</h2></div><span>{project.kind} · {project.dimensions.widthM.toFixed(1)} × {project.dimensions.depthM.toFixed(1)} m</span></div>
              <StudioModel scene={scene} />
              {sourceFile?.type.startsWith("image/") ? <section className="concept-studio" aria-labelledby="concept-title">
                <div><p className="product-eyebrow">Presentation derivative</p><h3 id="concept-title">See this direction in the photographed space.</h3><p>Nano Banana can edit the source into a visual hypothesis. The canonical 3D scene and evidence ledger remain the decision record.</p></div>
                {conceptRender?.status === "generated" && conceptRender.imageDataUrl ? <figure>
                  <Image src={conceptRender.imageDataUrl} alt={`AI-generated in-space concept for ${selectedOption.name}`} width={1200} height={800} unoptimized />
                  <figcaption><strong>AI presentation concept · not measured</strong>{conceptRender.disclosure}</figcaption>
                </figure> : conceptRender ? <p className="concept-status" role="status"><CircleAlert aria-hidden="true" size={17} />{conceptRender.disclosure}</p> : null}
                <button type="button" className="product-secondary" onClick={generateConcept} disabled={isGeneratingConcept}>{isGeneratingConcept ? "Rendering in-space concept…" : <><WandSparkles aria-hidden="true" size={18} />{conceptRender?.status === "generated" ? "Regenerate presentation concept" : "Generate in-space concept"}</>}</button>
              </section> : null}
            </div>
            <aside className="reason-rail" aria-label="Option reasoning and refinement">
              {sceneValidation ? <section className="validation-panel" data-status={sceneValidation.status} aria-labelledby="validation-title">
                <p className="rail-kicker">Deterministic spatial check</p>
                <h3 id="validation-title">{sceneValidation.status === "clear" ? "No footprint conflicts found." : sceneValidation.status === "blocked" ? "This state contains a blocking conflict." : "This state needs clearance review."}</h3>
                <p>{sceneValidation.status === "clear" ? "All modeled object footprints sit inside the entered envelope without overlap." : "Checks use entered envelope dimensions and modeled object footprints—not hidden site conditions."}</p>
                {sceneValidation.findings.length ? <ul>{sceneValidation.findings.map((finding) => <li key={finding.id} data-severity={finding.severity}><strong>{finding.type}</strong>{finding.message}</li>)}</ul> : null}
              </section> : null}
              <section>
                <p className="rail-kicker">Why it fits</p>
                <h3>{selectedOption.principle}</h3>
                <p>{selectedOption.rationale}</p>
                <ul>{selectedOption.tradeoffs.map((tradeoff) => <li key={tradeoff}>{tradeoff}</li>)}</ul>
              </section>
              <section>
                <p className="rail-kicker">Source ledger</p>
                <dl className="source-ledger">
                  <div><dt>Envelope</dt><dd>User-declared · {project.dimensions.widthM.toFixed(1)} × {project.dimensions.depthM.toFixed(1)} m</dd></div>
                  <div><dt>Objects</dt><dd>Observed/inferred · review before purchase</dd></div>
                  {project.source.analysis ? <div><dt>Visual read</dt><dd>{project.source.analysis.retainedObjects.length} retained object{project.source.analysis.retainedObjects.length === 1 ? "" : "s"} · {project.source.analysis.openings.length} opening{project.source.analysis.openings.length === 1 ? "" : "s"} · {project.source.analysis.confidence} confidence</dd></div> : null}
                  <div><dt>Option</dt><dd>Generated arrangement · deterministic preview</dd></div>
                  <div><dt>Review</dt><dd>{project.kind === "exterior" ? "Survey, setbacks, utilities, grade and drainage required" : "Openings and exact retained-object dimensions required"}</dd></div>
                </dl>
                <div className="constraint-ledger" aria-label="Constraints requiring review">
                  {scene.constraints.map((constraint) => (
                    <p key={constraint.id} data-severity={constraint.severity}>
                      <CircleAlert aria-hidden="true" size={16} />
                      <span><strong>{constraint.type.replaceAll("_", " ")}</strong>{constraint.message}</span>
                    </p>
                  ))}
                </div>
              </section>
              <section className="refinement-composer">
                <p className="rail-kicker">Bounded voice or text refinement</p>
                <h3>Say what should change.</h3>
                <label htmlFor="refinement-command">Command</label>
                <textarea id="refinement-command" rows={3} value={command} onChange={(event) => { setCommand(event.target.value); setParsedRefinement(undefined); }} />
                <p className="field-help">Try “Move the table right 30 cm,” “Replace the sofa with a compact two-seat sofa,” “Lock the sofa,” “Make the room warm and bright,” or “Undo.” Voice only captures a transcript; it never commits automatically.</p>
                <div className="composer-actions">
                  <button type="button" className="voice-button" data-listening={voiceState === "listening"} onClick={startVoice}>{voiceState === "listening" ? <MicOff aria-hidden="true" size={18} /> : <Mic aria-hidden="true" size={18} />}{voiceState === "listening" ? "Stop listening" : "Use voice"}</button>
                  <button type="button" className="product-secondary" onClick={prepareRefinement}>Compile action</button>
                </div>
                {voiceState === "unavailable" ? <p className="inline-note" role="status">Browser voice capture is unavailable. Type the same command instead.</p> : null}
                {voiceState === "error" ? <p className="form-error" role="alert">Voice capture ended. Check microphone permission or type the command.</p> : null}
                {parsedRefinement?.status === "needs_clarification" ? <p className="form-error" role="alert"><CircleAlert aria-hidden="true" size={17} />{parsedRefinement.question}</p> : null}
                {parsedRefinement?.status === "ready" ? (
                  <div className="typed-action">
                    <span><Sparkles aria-hidden="true" size={17} />Typed action · review before commit</span>
                    <strong>{parsedRefinement.summary}</strong>
                    <code>{JSON.stringify(parsedRefinement.action)}</code>
                    <button type="button" className="product-primary" onClick={applyRefinement}>Commit checked action<ArrowRight aria-hidden="true" size={17} /></button>
                  </div>
                ) : null}
              </section>
              {receipts.length > 0 ? <section className="action-receipts"><p className="rail-kicker">Action receipts</p>{receipts.map((receipt) => <article key={receipt.id} data-status={receipt.status}><span>{receipt.status}</span><strong>{receipt.summary}</strong><small>{receipt.transcript}</small>{receipt.warnings.map((warning) => <small key={warning} className="receipt-warning">Review · {warning}</small>)}<time dateTime={receipt.createdAt}>{new Date(receipt.createdAt).toLocaleString()}</time></article>)}</section> : null}
            </aside>
          </section>

          <section className="versions-section" id="versions" aria-labelledby="versions-title">
            <div className="section-folio">
              <p className="product-eyebrow">04 · versions, comparison, handoff</p>
              <h2 id="versions-title">Make the decision inspectable.</h2>
              <p>Save named factual scene states, compare what actually moved or changed, then export a scoped package for an architect or designer.</p>
            </div>
            <div className="version-grid">
              <section className="version-save">
                <h3>Save current direction</h3>
                <label>Version name<input value={versionName} onChange={(event) => setVersionName(event.target.value)} /></label>
                <button type="button" className="product-primary" onClick={saveVersion}><Save aria-hidden="true" size={18} />Save factual version</button>
                <ol className="version-list">{projectVersions.length === 0 ? <li className="empty-version">No saved version yet.</li> : projectVersions.map((version) => <li key={version.id}><div><strong>{version.name}</strong><span>{version.optionId.replaceAll("-", " ")} · {version.receipts.length} refinement receipt{version.receipts.length === 1 ? "" : "s"}</span></div><time dateTime={version.createdAt}>{new Date(version.createdAt).toLocaleString()}</time></li>)}</ol>
              </section>
              <section className="version-compare">
                <h3><GitCompareArrows aria-hidden="true" size={19} />Compare saved versions</h3>
                <div className="compare-selects">
                  <label>First<select value={firstCompareId} onChange={(event) => setFirstCompareId(event.target.value)}><option value="">Choose version</option>{projectVersions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label>
                  <label>Second<select value={secondCompareId} onChange={(event) => setSecondCompareId(event.target.value)}><option value="">Choose version</option>{projectVersions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label>
                </div>
                {comparison ? <SemanticDiff first={comparison.first} second={comparison.second} diff={comparison.diff} /> : <p className="compare-empty">Save and choose two different versions to see factual scene changes.</p>}
              </section>
              <section className="handoff-builder">
                <h3><Landmark aria-hidden="true" size={19} />Architect-ready handoff</h3>
                <label>Review scope<input value={handoffScope} onChange={(event) => setHandoffScope(event.target.value)} /></label>
                <label>Open questions<textarea rows={4} value={openQuestions} onChange={(event) => setOpenQuestions(event.target.value)} /></label>
                <p className="field-help">Exports entered sources, dimensions, named versions, receipts, unresolved review needs, and explicit limitations as JSON.</p>
                <button type="button" className="product-primary" onClick={downloadHandoff} disabled={projectVersions.length === 0}><Download aria-hidden="true" size={18} />Export review package</button>
              </section>
            </div>
          </section>

          <footer className="product-footer"><div><strong>Interiorin</strong><span>Decision support for real spaces, with uncertainty left visible.</span></div><button type="button" className="product-secondary" onClick={resetProject}><RotateCcw aria-hidden="true" size={17} />Start another project</button></footer>
        </>
      ) : null}
    </main>
  );
}

function AnalysisLedger({ envelope }: { envelope: SpaceAnalysisEnvelope }) {
  if (envelope.status !== "analyzed" || !envelope.analysis) {
    return <div className="analysis-ledger" data-status={envelope.status} role="status"><CircleAlert aria-hidden="true" size={17} /><p><strong>Visual analysis not applied</strong>{envelope.disclosure}</p></div>;
  }
  const analysis = envelope.analysis;
  return (
    <div className="analysis-ledger" data-status="analyzed" role="status">
      <Check aria-hidden="true" size={17} />
      <div>
        <p><strong>Visible-space read · {analysis.confidence} confidence</strong>{analysis.summary}</p>
        <dl>
          <div><dt>Space</dt><dd>{analysis.spaceType} · {analysis.spaceKind}</dd></div>
          <div><dt>Openings</dt><dd>{analysis.openings.length ? analysis.openings.map((opening) => opening.label).join(", ") : "None confidently visible"}</dd></div>
          <div><dt>Retained</dt><dd>{analysis.retainedObjects.length ? analysis.retainedObjects.map((object) => object.label).join(", ") : "None confidently visible"}</dd></div>
          <div><dt>Style cues</dt><dd>{analysis.styleCues.length ? analysis.styleCues.map((cue) => cue.label).join(", ") : "No reliable cue"}</dd></div>
          <div><dt>Natural light</dt><dd>{analysis.naturalLight.level} · {analysis.naturalLight.note}</dd></div>
        </dl>
        <small>{analysis.metricWarning} {envelope.disclosure}</small>
      </div>
    </div>
  );
}

function ValidationBadge({ status }: { status: "clear" | "review" | "blocked" }) {
  return <span className="validation-badge" data-status={status}>{status === "clear" ? "Footprints clear" : status === "review" ? "Review clearance" : "Conflict found"}</span>;
}

function SemanticDiff({ first, second, diff }: { first: StudioVersion; second: StudioVersion; diff: ReturnType<typeof compareScenes> }) {
  const rows = [
    ["Objects added", diff.addedObjects.map((item) => item.label).join(", ") || "None"],
    ["Objects removed", diff.removedObjects.map((item) => item.label).join(", ") || "None"],
    ["Objects moved", diff.movedObjects.map((item) => `${item.label}: x ${item.before.x.toFixed(2)}→${item.after.x.toFixed(2)}, z ${item.before.z.toFixed(2)}→${item.after.z.toFixed(2)} m`).join("; ") || "None"],
    ["Materials", diff.materialChanges.map((item) => `${item.label}: ${item.before}→${item.after}`).join("; ") || "None"],
    ["Lighting", diff.environmentChange ? `${diff.environmentChange.before.warmth}/${diff.environmentChange.before.intensity}→${diff.environmentChange.after.warmth}/${diff.environmentChange.after.intensity}` : "None"],
    ["Resolved constraints", diff.resolvedConstraints.map((item) => item.message).join("; ") || "None"],
  ];
  return (
    <div className="semantic-diff">
      <p><strong>{first.name}</strong><ChevronRight aria-hidden="true" size={16} /><strong>{second.name}</strong></p>
      <table><caption>Factual scene changes between saved versions.</caption><thead><tr><th scope="col">Criterion</th><th scope="col">Difference</th></tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>
    </div>
  );
}
