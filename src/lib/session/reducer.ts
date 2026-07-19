import { pairedCanonicalStateSchema, type PairedCanonicalState, type StudioCommand, type StudioEvent } from "./schema";
import { generateStudioOptions } from "@/lib/studio/generator";
import { studioProjectSchema } from "@/lib/studio/schema";
import { resolveSceneAction } from "@/lib/spatial/action-resolver";
import { applyStudioRefinement } from "@/lib/studio/refinement";
import { compareScenes } from "@/lib/spatial/diff";

export function eventTypeForCommand(command: StudioCommand): StudioEvent["eventType"] {
  const eventTypes: Record<StudioCommand["type"], StudioEvent["eventType"]> = {
    submit_source: "source_submitted", confirm_analysis: "source_analyzed", submit_brief: "brief_confirmed",
    generate_options: "options_generated", select_option: "option_selected", request_refinement: "refinement_requested",
    confirm_proposal: "scene_committed", reject_proposal: "proposal_rejected", save_version: "version_saved",
    select_comparison: "comparison_selected", select_review_version: "review_version_selected", end_session: "session_ended",
  };
  return eventTypes[command.type];
}

export function applyStudioCommand(current: unknown, command: StudioCommand, sessionId: string): PairedCanonicalState {
  const state = pairedCanonicalStateSchema.parse(current ?? {});
  if (command.type === "submit_source") return pairedCanonicalStateSchema.parse({
    ...state,
    stage: "brief",
    source: { objectPath: command.sourceObjectPath, fileName: command.fileName, mimeType: command.mimeType, byteSize: command.byteSize, pixelWidth: command.pixelWidth, pixelHeight: command.pixelHeight, dimensions: command.dimensions },
  });
  if (command.type === "confirm_analysis") return pairedCanonicalStateSchema.parse({ ...state, analysis: command.analysis, analysisDisclosure: command.disclosure, acceptedRetainedObjectIds: command.acceptedRetainedObjectIds });
  if (command.type === "submit_brief") return pairedCanonicalStateSchema.parse({ ...state, brief: command.answers, stage: "brief" });
  if (command.type === "generate_options") {
    if (!state.source || !state.brief) throw new Error("Confirm the room source, dimensions, and brief before generating options.");
    const analysis = state.analysis ? {
      ...state.analysis,
      retainedObjects: state.analysis.retainedObjects.filter((_, index) => state.acceptedRetainedObjectIds.includes(`retained-${index}`)),
    } : undefined;
    const project = studioProjectSchema.parse({
      id: `paired-${sessionId}`,
      name: "Paired room",
      kind: "interior",
      condition: analysis?.retainedObjects.length ? "existing" : "empty",
      intent: `${state.brief.purpose}. Feel: ${state.brief.feeling}. Keep: ${state.brief.mustKeep}. Improve or avoid: ${state.brief.improveOrAvoid}`,
      dimensions: state.source.dimensions,
      source: { mode: "photo_with_measurements", fileName: state.source.fileName, fileSize: state.source.byteSize, authority: "user_declared", analysis, analysisDisclosure: state.analysisDisclosure },
      createdAt: command.clientTimestamp,
    });
    const options = generateStudioOptions(project);
    return pairedCanonicalStateSchema.parse({ ...state, stage: "options", options, selectedOptionId: options[0]?.id });
  }
  if (command.type === "select_option") {
    if (!state.options.some((option) => option.id === command.optionId)) throw new Error("Choose an option generated for this session.");
    return pairedCanonicalStateSchema.parse({ ...state, stage: "refine", selectedOptionId: command.optionId });
  }
  if (command.type === "request_refinement") {
    if (!state.selectedOptionId) throw new Error("Select a generated direction before refining it.");
    const option = state.options.find((candidate) => candidate.id === state.selectedOptionId);
    if (!option) throw new Error("The selected canonical scene is unavailable.");
    if (state.proposals.length >= 20) throw new Error("This session reached its 20-refinement limit.");
    const receipt = command.interpretation.action ? resolveSceneAction(option.scene, command.interpretation.action) : undefined;
    const status = !command.interpretation.action ? "clarification" : receipt?.status === "accepted" ? "awaiting_approval" : "rejected";
    const proposal = { id: command.idempotencyKey, transcript: command.transcript, interpretation: command.interpretation, receipt, status, createdAt: command.clientTimestamp };
    return pairedCanonicalStateSchema.parse({ ...state, stage: status === "awaiting_approval" ? "approve" : "refine", proposals: [...state.proposals, proposal], receipts: status === "rejected" ? [...state.receipts, { ...proposal, decidedAt: command.clientTimestamp }] : state.receipts });
  }
  if (command.type === "confirm_proposal") {
    const proposal = state.proposals.find((candidate) => candidate.id === command.proposalId);
    if (!proposal || proposal.status !== "awaiting_approval" || !proposal.interpretation.action || !proposal.interpretation.summary) throw new Error("That proposal is not awaiting approval.");
    const optionIndex = state.options.findIndex((option) => option.id === state.selectedOptionId);
    const option = state.options[optionIndex];
    if (!option) throw new Error("The selected canonical scene is unavailable.");
    const before = option.scene;
    const applied = applyStudioRefinement(before, { status: "ready", action: proposal.interpretation.action, summary: proposal.interpretation.summary });
    if (applied.receipt.status !== "accepted") throw new Error(applied.receipt.message);
    const committed = { ...proposal, receipt: applied.receipt, status: "committed" as const, decidedAt: command.clientTimestamp, beforeAfterDiff: compareScenes(before, applied.scene) as unknown as Record<string, unknown> };
    const options = [...state.options]; options[optionIndex] = { ...option, scene: applied.scene };
    return pairedCanonicalStateSchema.parse({ ...state, stage: "refine", options, proposals: state.proposals.map((candidate) => candidate.id === proposal.id ? committed : candidate), receipts: [...state.receipts, committed] });
  }
  if (command.type === "reject_proposal") {
    const proposal = state.proposals.find((candidate) => candidate.id === command.proposalId);
    if (!proposal || proposal.status !== "awaiting_approval") throw new Error("That proposal is not awaiting approval.");
    const rejected = { ...proposal, status: "rejected" as const, decidedAt: command.clientTimestamp };
    return pairedCanonicalStateSchema.parse({ ...state, stage: "refine", proposals: state.proposals.map((candidate) => candidate.id === proposal.id ? rejected : candidate), receipts: [...state.receipts, rejected] });
  }
  if (command.type === "save_version") {
    if (state.versions.length >= 12) throw new Error("This session reached its 12-version limit.");
    const option = state.options.find((candidate) => candidate.id === state.selectedOptionId);
    if (!option) throw new Error("Select a canonical direction before saving a version.");
    const version = { id: command.idempotencyKey, name: command.name, optionId: option.id, scene: structuredClone(option.scene), createdAt: command.clientTimestamp };
    return pairedCanonicalStateSchema.parse({ ...state, versions: [...state.versions, version], selectedReviewVersionId: state.selectedReviewVersionId ?? version.id });
  }
  if (command.type === "select_comparison") {
    if (command.firstVersionId === command.secondVersionId || !state.versions.some((version) => version.id === command.firstVersionId) || !state.versions.some((version) => version.id === command.secondVersionId)) throw new Error("Choose two different saved versions from this session.");
    return pairedCanonicalStateSchema.parse({ ...state, comparison: { firstVersionId: command.firstVersionId, secondVersionId: command.secondVersionId } });
  }
  if (command.type === "select_review_version") {
    if (!state.versions.some((version) => version.id === command.versionId)) throw new Error("Choose a saved canonical version for architect review.");
    return pairedCanonicalStateSchema.parse({ ...state, selectedReviewVersionId: command.versionId });
  }
  if (command.type === "end_session") return pairedCanonicalStateSchema.parse({ ...state, stage: "ended" });
  return state;
}
