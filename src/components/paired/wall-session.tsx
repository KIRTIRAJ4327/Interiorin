"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, Link2, Radio, ScanLine, ShieldCheck } from "lucide-react";
import type { SessionCreateEnvelope, StudioEvent } from "@/lib/session/schema";
import { createSessionTransport } from "@/lib/session/transport";

export function WallSession({ sessionId }: { sessionId: string }) {
  const [session] = useState<SessionCreateEnvelope | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(`interiorin:created:${sessionId}`);
    return raw ? JSON.parse(raw) as SessionCreateEnvelope : null;
  });
  const [connection, setConnection] = useState<"connecting" | "waiting" | "paired" | "error">("connecting");
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [message, setMessage] = useState("Opening the private session channel…");

  const mode = useMemo(() => session?.mode ?? (typeof window === "undefined" ? "same_device" : (localStorage.getItem(`interiorin:mode:${sessionId}`) as "supabase" | "same_device" | null) ?? "same_device"), [session, sessionId]);

  useEffect(() => {
    const transport = createSessionTransport(mode, sessionId, "wall");
    let mounted = true;
    const unsubscribe = transport.subscribe((event) => {
      if (!mounted) return;
      setEvents((current) => [...current.filter((item) => item.id !== event.id), event].slice(-12));
      if (event.eventType === "controller_joined") {
        setConnection("paired");
        setMessage("Phone controller authenticated. The wall is ready for room intake.");
      }
    });
    void transport.connect().then(async () => {
      if (!mounted) return;
      const snapshot = await transport.recover().catch(() => null);
      if (!mounted) return;
      setEvents(snapshot?.events ?? []);
      const paired = snapshot?.members.some((member) => member.role === "controller") ?? false;
      setConnection(paired ? "paired" : "waiting");
      setMessage(paired ? "Phone controller recovered and authenticated." : "Channel ready. Scan the code with the homeowner’s phone.");
    }).catch((cause: unknown) => {
      if (!mounted) return;
      setConnection("error");
      setMessage(cause instanceof Error ? cause.message : "The session channel could not connect.");
    });
    return () => { mounted = false; unsubscribe(); void transport.dispose(); };
  }, [mode, sessionId]);

  const joined = connection === "paired";
  return (
    <main className="wall-shell" id="main-content">
      <header className="wall-header">
        <Link className="wordmark" href="/wall">Interiorin</Link>
        <span className={`connection-pill connection-pill--${connection}`}><Radio size={16} aria-hidden="true" /> {joined ? "Phone paired" : connection}</span>
        <Link className="paired-text-link" href="/studio">Combined studio</Link>
      </header>
      <section className="wall-stage" aria-labelledby="wall-title">
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
      </section>
    </main>
  );
}

function TraceStep({ done, active = false, label, detail }: { done: boolean; active?: boolean; label: string; detail: string }) {
  return <li className={done ? "is-done" : active ? "is-active" : ""}><span>{done ? <Check aria-hidden="true" /> : null}</span><div><strong>{label}</strong><small>{detail}</small></div></li>;
}
