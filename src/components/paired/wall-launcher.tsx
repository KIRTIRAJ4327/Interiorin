"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle, MonitorUp } from "lucide-react";
import { getAnonymousAccessToken } from "@/lib/supabase/browser";
import { sessionCreateEnvelopeSchema } from "@/lib/session/schema";

export function WallLauncher() {
  const [status, setStatus] = useState<"idle" | "creating" | "error">("idle");
  const [error, setError] = useState("");

  async function createSession() {
    setStatus("creating");
    setError("");
    try {
      const token = await getAnonymousAccessToken();
      const response = await fetch("/api/sessions", { method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {} });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Session creation failed.");
      const session = sessionCreateEnvelopeSchema.parse(body);
      sessionStorage.setItem(`interiorin:created:${session.sessionId}`, JSON.stringify(session));
      localStorage.setItem(`interiorin:mode:${session.sessionId}`, session.mode);
      window.location.assign(`/wall/${session.sessionId}`);
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Session creation failed.");
    }
  }

  return (
    <main className="paired-entry" id="main-content">
      <div className="paired-entry__mark" aria-hidden="true"><MonitorUp size={28} /></div>
      <p className="eyebrow">Paired spatial studio</p>
      <h1>Turn this laptop into the Studio Wall.</h1>
      <p className="paired-entry__lede">A phone captures the room and decisions. This screen holds the canonical 3D model, checked changes, and architect review package.</p>
      <dl className="paired-entry__facts">
        <div><dt>Authority</dt><dd>Entered dimensions + deterministic spatial checks</dd></div>
        <div><dt>Privacy</dt><dd>Single controller · one-time pairing · 24-hour session</dd></div>
        <div><dt>Fallback</dt><dd>Same-browser mode is disclosed when cloud pairing is unavailable</dd></div>
      </dl>
      <button className="paired-primary" onClick={createSession} disabled={status === "creating"}>
        {status === "creating" ? <LoaderCircle className="spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
        {status === "creating" ? "Preparing private session…" : "Create Studio Wall"}
      </button>
      {error ? <p className="paired-error" role="alert">{error}</p> : null}
      <a className="paired-text-link" href="/studio">Open combined studio fallback</a>
    </main>
  );
}
