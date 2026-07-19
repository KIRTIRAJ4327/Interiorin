const enabled = (value: string | undefined, fallback = false) =>
  value === undefined ? fallback : value.trim() === "true";

export const productFeatures = Object.freeze({
  pairedExperience: enabled(process.env.NEXT_PUBLIC_ENABLE_PAIRED_EXPERIENCE, true),
  liveRefinement: enabled(process.env.ENABLE_LIVE_OPENAI),
  conceptRender: enabled(process.env.NEXT_PUBLIC_ENABLE_CONCEPT_RENDER),
  phone3dPreview: enabled(process.env.NEXT_PUBLIC_ENABLE_PHONE_3D_PREVIEW),
  voiceGuide: enabled(process.env.NEXT_PUBLIC_ENABLE_VOICE_GUIDE, true),
  visualReveal: enabled(process.env.NEXT_PUBLIC_ENABLE_VISUAL_REVEAL, true),
});
