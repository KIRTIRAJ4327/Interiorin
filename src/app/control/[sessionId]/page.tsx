import { PhoneController } from "@/components/paired/phone-controller";

export default async function ControllerPage({ params, searchParams }: { params: Promise<{ sessionId: string }>; searchParams: Promise<{ token?: string; mode?: string }> }) {
  const [{ sessionId }, query] = await Promise.all([params, searchParams]);
  return <PhoneController sessionId={sessionId} token={query.token ?? ""} requestedMode={query.mode} />;
}
