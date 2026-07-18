import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretConfig } from "./config";

export function getSupabaseAdmin() {
  const config = getSupabaseSecretConfig();
  if (!config) return null;
  return createClient(config.url, config.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function authenticateAccessToken(accessToken: string | null) {
  const admin = getSupabaseAdmin();
  if (!admin || !accessToken) return null;
  const result = await admin.auth.getUser(accessToken);
  return result.error ? null : result.data.user;
}
