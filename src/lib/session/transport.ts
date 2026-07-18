"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { StudioCommand, StudioEvent, StudioSnapshot, StudioMemberRole } from "./schema";
import { getAnonymousAccessToken, getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { applyStudioCommand, eventTypeForCommand } from "./reducer";

export interface SessionTransport {
  connect(): Promise<void>;
  sendCommand(command: StudioCommand): Promise<void>;
  subscribe(listener: (event: StudioEvent) => void): () => void;
  recover(afterEventId?: number): Promise<StudioSnapshot>;
  dispose(): Promise<void>;
}

type LocalMessage = { event: StudioEvent; snapshot: StudioSnapshot };

export class BroadcastChannelSessionTransport implements SessionTransport {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<(event: StudioEvent) => void>();
  private readonly storageKey: string;

  constructor(private readonly sessionId: string, private readonly role: StudioMemberRole) {
    this.storageKey = `interiorin:session:${sessionId}`;
  }

  async connect() {
    this.channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(`interiorin:${this.sessionId}`);
    this.channel?.addEventListener("message", (message: MessageEvent<LocalMessage>) => {
      if (!message.data?.event) return;
      localStorage.setItem(this.storageKey, JSON.stringify(message.data.snapshot));
      this.listeners.forEach((listener) => listener(message.data.event));
    });
    if (this.role === "controller") this.publish("controller_joined", { status: "active" });
  }

  async sendCommand(command: StudioCommand) {
    const existing = this.readSnapshot();
    if (existing.events.some((event) => event.payload.idempotencyKey === command.idempotencyKey)) return;
    if (command.expectedRevision !== existing.revision) throw new Error(`Scene changed on another surface. Recover revision ${existing.revision} and try again.`);
    const canonicalState = applyStudioCommand(existing.canonicalState, command, this.sessionId);
    this.publish(eventTypeForCommand(command), { commandType: command.type, idempotencyKey: command.idempotencyKey }, canonicalState, existing.revision + 1);
  }

  subscribe(listener: (event: StudioEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async recover() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) return JSON.parse(raw) as StudioSnapshot;
    return this.makeSnapshot([]);
  }

  async dispose() {
    this.channel?.close();
    this.channel = null;
    this.listeners.clear();
  }

  private publish(eventType: StudioEvent["eventType"], payload: Record<string, unknown>, canonicalState?: Record<string, unknown>, revision?: number) {
    const existing = this.readSnapshot();
    const event: StudioEvent = {
      id: existing.lastEventId + 1,
      sessionId: this.sessionId,
      eventType,
      actorRole: this.role,
      payload,
      createdAt: new Date().toISOString(),
    };
    const snapshot = this.makeSnapshot([...existing.events, event], canonicalState ?? existing.canonicalState, revision ?? existing.revision);
    localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
    this.channel?.postMessage({ event, snapshot } satisfies LocalMessage);
    this.listeners.forEach((listener) => listener(event));
  }

  private readSnapshot() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as StudioSnapshot) : this.makeSnapshot([]);
  }

  private makeSnapshot(events: StudioEvent[], canonicalState: Record<string, unknown> = {}, revision = 0): StudioSnapshot {
    const controllerJoined = events.some((event) => event.eventType === "controller_joined");
    return {
      sessionId: this.sessionId,
      topic: `studio:${this.sessionId}`,
      revision,
      status: controllerJoined ? "active" : "pairing",
      canonicalState,
      lastEventId: events.at(-1)?.id ?? 0,
      events: events.slice(-500),
      members: controllerJoined
        ? [{ role: "wall", joinedAt: new Date().toISOString() }, { role: "controller", joinedAt: new Date().toISOString() }]
        : [{ role: "wall", joinedAt: new Date().toISOString() }],
      expiresAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    };
  }
}

export class SupabaseSessionTransport implements SessionTransport {
  private channel: RealtimeChannel | null = null;
  private listeners = new Set<(event: StudioEvent) => void>();

  constructor(private readonly sessionId: string, private readonly role: StudioMemberRole) {}

  async connect() {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase is not configured.");
    await getAnonymousAccessToken();
    this.channel = client.channel(`studio:${this.sessionId}`, { config: { private: true, presence: { key: this.role } } });
    this.channel.on("broadcast", { event: "studio_event" }, ({ payload }) => {
      const event = payload as StudioEvent;
      this.listeners.forEach((listener) => listener(event));
    });
    this.channel.on("presence", { event: "join" }, ({ newPresences }) => {
      if (this.role !== "wall" || !newPresences.some((presence) => presence.role === "controller")) return;
      const event: StudioEvent = {
        id: Date.now(),
        sessionId: this.sessionId,
        eventType: "controller_joined",
        actorRole: "controller",
        payload: { status: "active" },
        createdAt: new Date().toISOString(),
      };
      this.listeners.forEach((listener) => listener(event));
    });
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Private channel connection timed out.")), 8_000);
      this.channel?.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          window.clearTimeout(timeout);
          await this.channel?.track({ role: this.role, connectedAt: new Date().toISOString() });
          resolve();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          window.clearTimeout(timeout);
          reject(new Error("Private channel connection failed."));
        }
      });
    });
  }

  async sendCommand(command: StudioCommand) {
    const token = await getAnonymousAccessToken();
    const response = await fetch(`/api/sessions/${this.sessionId}/commands`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error((await response.json()).error ?? "Command failed.");
  }

  subscribe(listener: (event: StudioEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async recover(afterEventId = 0) {
    const token = await getAnonymousAccessToken();
    const response = await fetch(`/api/sessions/${this.sessionId}?after=${afterEventId}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
    if (!response.ok) throw new Error((await response.json()).error ?? "Recovery failed.");
    return response.json() as Promise<StudioSnapshot>;
  }

  async dispose() {
    const client = getSupabaseBrowserClient();
    if (client && this.channel) await client.removeChannel(this.channel);
    this.channel = null;
    this.listeners.clear();
  }
}

export function createSessionTransport(mode: "supabase" | "same_device", sessionId: string, role: StudioMemberRole) {
  return mode === "supabase"
    ? new SupabaseSessionTransport(sessionId, role)
    : new BroadcastChannelSessionTransport(sessionId, role);
}
