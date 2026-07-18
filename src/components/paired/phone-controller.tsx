"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Check, ChevronRight, LoaderCircle, LockKeyhole, Mic, Ruler, ShieldCheck } from "lucide-react";
import { getAnonymousAccessToken } from "@/lib/supabase/browser";
import { sessionJoinEnvelopeSchema, type SessionJoinEnvelope } from "@/lib/session/schema";
import { createSessionTransport } from "@/lib/session/transport";

export function PhoneController({ sessionId, token, requestedMode }: { sessionId: string; token: string; requestedMode?: string }) {
  const [join, setJoin] = useState<SessionJoinEnvelope | null>(null);
  const [status, setStatus] = useState<"joining" | "connected" | "error">("joining");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function pair() {
      try {
        const accessToken = requestedMode === "same_device" ? null : await getAnonymousAccessToken();
        const response = await fetch(`/api/sessions/${sessionId}/join`, {
          method: "POST",
          headers: { "content-type": "application/json", ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
          body: JSON.stringify({ token }),
        });
        const body: unknown = await response.json();
        if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Pairing failed.");
        const paired = sessionJoinEnvelopeSchema.parse(body);
        if (!mounted) return;
        setJoin(paired);
        localStorage.setItem(`interiorin:mode:${sessionId}`, paired.mode);
        window.history.replaceState({}, "", `/control/${sessionId}`);
        const transport = createSessionTransport(paired.mode, sessionId, "controller");
        await transport.connect();
        if (mounted) setStatus("connected");
      } catch (cause) {
        if (!mounted) return;
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Pairing failed.");
      }
    }
    void pair();
    return () => { mounted = false; };
  }, [requestedMode, sessionId, token]);

  if (status === "joining") return <PhoneStatus icon={<LoaderCircle className="spin" />} title="Pairing securely…" detail="Authenticating this phone and claiming the one-time controller seat." />;
  if (status === "error") return <PhoneStatus icon={<LockKeyhole />} title="This phone could not join." detail={error} error />;

  return (
    <main className="phone-shell" id="main-content">
      <header className="phone-header">
        <div><p className="eyebrow">Interiorin controller</p><strong>Room intake</strong></div>
        <span className="phone-connection"><Check aria-hidden="true" /> Paired</span>
      </header>
      <div className="phone-progress" aria-label="Journey progress"><span className="is-current">Space</span><span>Brief</span><span>Options</span><span>Refine</span><span>Approve</span></div>
      <section className="phone-stage" aria-labelledby="phone-title">
        <p className="eyebrow">Step 1 of 5 · Space</p>
        <h1 id="phone-title">Show us the room. You keep control of the facts.</h1>
        <p>The photo helps identify visible cues. Only the dimensions you enter become metric authority.</p>
        <button className="phone-action" disabled><Camera aria-hidden="true" /><span><strong>Capture room photo</strong><small>Orientation-corrected JPEG · maximum 5 MB</small></span><ChevronRight aria-hidden="true" /></button>
        <button className="phone-action" disabled><Ruler aria-hidden="true" /><span><strong>Enter width, depth and height</strong><small>Declared measurements anchor the canonical room</small></span><ChevronRight aria-hidden="true" /></button>
        <button className="phone-action" disabled><Mic aria-hidden="true" /><span><strong>Describe what this room needs</strong><small>Push-to-talk always has a typed fallback</small></span><ChevronRight aria-hidden="true" /></button>
        <p className="paired-notice"><ShieldCheck aria-hidden="true" /> {join?.disclosure}</p>
        <p className="phase-note">Pairing proof complete. Room intake unlocks in Phase 3 after the canonical visual room is verified.</p>
      </section>
    </main>
  );
}

function PhoneStatus({ icon, title, detail, error = false }: { icon: React.ReactNode; title: string; detail: string; error?: boolean }) {
  return <main className={`phone-status ${error ? "phone-status--error" : ""}`}><div aria-hidden="true">{icon}</div><p className="eyebrow">Interiorin controller</p><h1>{title}</h1><p role={error ? "alert" : undefined}>{detail}</p>{error ? <Link className="paired-text-link" href="/wall">Return to Studio Wall</Link> : null}</main>;
}
