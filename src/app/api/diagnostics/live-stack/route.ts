import { NextResponse } from "next/server";
import { getSupabaseSecretConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const expected = process.env.SESSION_CLEANUP_SECRET?.trim();
  if (!expected || request.headers.get("x-interiorin-diagnostic") !== expected) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({
    liveSupabase: process.env.NEXT_PUBLIC_ENABLE_LIVE_SUPABASE === "true",
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    publishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()),
    secretKey: Boolean(process.env.SUPABASE_SECRET_KEY?.trim()),
    tokenPepper: Boolean(process.env.SESSION_TOKEN_PEPPER?.trim()),
    configReady: Boolean(getSupabaseSecretConfig()),
  });
}
