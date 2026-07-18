"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

let browserClient: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient !== undefined) return browserClient;
  const config = getSupabasePublicConfig();
  browserClient = config
    ? createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null;
  return browserClient;
}

export async function getAnonymousAccessToken() {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const existing = await client.auth.getSession();
  if (existing.data.session?.access_token) return existing.data.session.access_token;
  const signedIn = await client.auth.signInAnonymously();
  if (signedIn.error) throw signedIn.error;
  return signedIn.data.session?.access_token ?? null;
}
