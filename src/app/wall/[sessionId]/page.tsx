import { WallSession } from "@/components/paired/wall-session";

export default async function WallSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <WallSession sessionId={sessionId} />;
}
