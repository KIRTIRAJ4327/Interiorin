"use client";

import { ConversationProvider, useConversationControls, useConversationInput, useConversationMode, useConversationStatus } from "@elevenlabs/react";
import { Keyboard, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAnonymousAccessToken } from "@/lib/supabase/browser";
import { voiceBriefSchema, voiceRefinementSchema, voiceSessionEnvelopeSchema, type VoiceBrief } from "@/lib/voice/schema";

type VoiceGuideProps = {
  sessionId: string;
  stage: "intent" | "design" | "finish";
  summary: string;
  typing: boolean;
  onBrief: (brief: VoiceBrief) => void;
  onRefinement: (transcript: string) => Promise<string>;
  onTypeInstead: () => void;
};

export function VoiceGuide(props: VoiceGuideProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "agent"; message: string }>>([]);
  const [consented, setConsented] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof voiceSessionEnvelopeSchema.parse> | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const clientTools = useMemo(() => ({
    record_design_brief: (parameters: Record<string, unknown>) => {
      if (props.stage !== "intent") return "Brief capture is closed. Read the current design summary instead.";
      const parsed = voiceBriefSchema.safeParse(parameters);
      if (!parsed.success) return "The brief was not recorded because one or more fields were missing or too long.";
      props.onBrief(parsed.data);
      return "The editable four-part brief is ready on the phone. Ask the homeowner to review and confirm it.";
    },
    submit_refinement: async (parameters: Record<string, unknown>) => {
      if (props.stage !== "design") return "Refinement is unavailable in this stage.";
      const parsed = voiceRefinementSchema.safeParse(parameters);
      if (!parsed.success) return "The refinement was not submitted because the final transcript was invalid.";
      return props.onRefinement(parsed.data.transcript);
    },
    read_design_summary: () => props.summary.slice(0, 700),
  }), [props]);

  async function connect() {
    if (!consented) { setError("Review and accept the AI voice disclosure first."); return; }
    setConnecting(true); setError("");
    try {
      const accessToken = await getAnonymousAccessToken();
      if (!accessToken) throw new Error("Verified phone pairing is required for voice. Continue by typing in same-device mode.");
      const response = await fetch(`/api/sessions/${props.sessionId}/voice-session`, { method: "POST", headers: { authorization: `Bearer ${accessToken}` } });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Voice could not connect.");
      setSession(voiceSessionEnvelopeSchema.parse(body));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Voice could not connect. Continue by typing."); }
    finally { setConnecting(false); }
  }

  if (!session) return <VoiceGuideStart
    stage={props.stage}
    consented={consented}
    connecting={connecting}
    error={error}
    onConsent={setConsented}
    onConnect={connect}
    onTypeInstead={props.onTypeInstead}
  />;

  return <ConversationProvider
    clientTools={clientTools}
    onMessage={({ role, message }) => setMessages((current) => [...current, { role, message: message.slice(0, 500) }].slice(-6))}
  >
    <VoiceGuideControls {...props} session={session} messages={messages} onStopped={() => setSession(null)} />
  </ConversationProvider>;
}

function VoiceGuideStart({ stage, consented, connecting, error, onConsent, onConnect, onTypeInstead }: {
  stage: VoiceGuideProps["stage"];
  consented: boolean;
  connecting: boolean;
  error: string;
  onConsent: (value: boolean) => void;
  onConnect: () => Promise<void>;
  onTypeInstead: () => void;
}) {
  return <section className="voice-guide" aria-labelledby={`voice-title-${stage}`}>
    <div className="voice-guide__heading"><div><p className="eyebrow">ElevenLabs voice · optional</p><h2 id={`voice-title-${stage}`}>{stage === "intent" ? "Say the whole brief once." : stage === "design" ? "Speak one change at a time." : "Hear a concise closing recap."}</h2></div><span data-status="disconnected"><span aria-hidden="true" />Optional voice guide</span></div>
    <label className="voice-consent"><input type="checkbox" checked={consented} onChange={(event) => onConsent(event.target.checked)} /><span><strong>Start an AI voice conversation</strong><small>Audio is sent to ElevenLabs for live transcription and response. Voice is optional; do not share sensitive information.</small></span></label>
    <div className="voice-guide__actions"><button type="button" onClick={() => void onConnect()} disabled={!consented || connecting}><Mic aria-hidden="true" /> {connecting ? "Connecting securely" : "Start voice"}</button><button type="button" onClick={onTypeInstead}><Keyboard aria-hidden="true" /> Type instead</button></div>
    {error ? <p className="paired-error" role="alert">{error} <button type="button" onClick={onTypeInstead}>Continue typing</button></p> : null}
  </section>;
}

function VoiceGuideControls({ stage, typing, onTypeInstead, session, messages, onStopped }: VoiceGuideProps & { session: ReturnType<typeof voiceSessionEnvelopeSchema.parse>; messages: Array<{ role: "user" | "agent"; message: string }>; onStopped: () => void }) {
  const { startSession, endSession, setVolume } = useConversationControls();
  const { isMuted, setMuted } = useConversationInput();
  const { status, message: statusMessage } = useConversationStatus();
  const { isSpeaking, isListening } = useConversationMode();
  const [outputMuted, setOutputMuted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startSession({ signedUrl: session.signedUrl, connectionType: "websocket", dynamicVariables: session.initialization });
  }, [session, startSession]);

  useEffect(() => {
    setVolume({ volume: typing || outputMuted ? 0 : 1 });
  }, [outputMuted, setVolume, typing]);

  function typeInstead() {
    setVolume({ volume: 0 });
    setOutputMuted(true);
    onTypeInstead();
  }

  const activity = status === "connecting" ? "Connecting securely" : isSpeaking ? "Voice guide speaking" : isListening ? "Listening" : status === "connected" ? "Ready for your answer" : "Optional voice guide";
  return <section className="voice-guide" aria-labelledby={`voice-title-${stage}`}>
    <div className="voice-guide__heading"><div><p className="eyebrow">ElevenLabs voice · optional</p><h2 id={`voice-title-${stage}`}>{stage === "intent" ? "Say the whole brief once." : stage === "design" ? "Speak one change at a time." : "Hear a concise closing recap."}</h2></div><span data-status={status}><span aria-hidden="true" />{activity}</span></div>
    <div className="voice-guide__controls" aria-label="Voice controls">
      <button type="button" onClick={() => setMuted(!isMuted)} aria-pressed={isMuted}>{isMuted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}{isMuted ? "Unmute microphone" : "Mute microphone"}</button>
      <button type="button" onClick={() => setOutputMuted((current) => !current)} aria-pressed={outputMuted}>{outputMuted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}{outputMuted ? "Unmute voice replies" : "Mute voice replies"}</button>
      <button type="button" onClick={typeInstead}><Keyboard aria-hidden="true" /> Type instead</button>
      <button type="button" onClick={() => { endSession(); onStopped(); }}><PhoneOff aria-hidden="true" /> Stop voice</button>
    </div>
    {messages.length ? <div className="voice-transcript" aria-live="polite">{messages.slice(-2).map((item, index) => <p key={`${item.role}-${index}`}><strong>{item.role === "user" ? "You" : "Guide"}</strong>{item.message}</p>)}</div> : null}
    {statusMessage ? <p className="paired-error" role="alert">{statusMessage} <button type="button" onClick={typeInstead}>Continue typing</button></p> : null}
  </section>;
}
