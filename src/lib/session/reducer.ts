import { pairedCanonicalStateSchema, type PairedCanonicalState, type StudioCommand, type StudioEvent } from "./schema";
import { generateStudioOptions } from "@/lib/studio/generator";
import { studioProjectSchema } from "@/lib/studio/schema";

export function eventTypeForCommand(command: StudioCommand): StudioEvent["eventType"] {
  const eventTypes: Record<StudioCommand["type"], StudioEvent["eventType"]> = {
    submit_source: "source_submitted", confirm_analysis: "source_analyzed", submit_brief: "brief_confirmed",
    generate_options: "options_generated", select_option: "option_selected", request_refinement: "refinement_requested",
    confirm_proposal: "proposal_confirmed", reject_proposal: "proposal_rejected", save_version: "version_saved",
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
  if (command.type === "end_session") return pairedCanonicalStateSchema.parse({ ...state, stage: "ended" });
  return state;
}
