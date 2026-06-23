import SessionClient from "./SessionClient";

export const metadata = {
  title: "Split your bill · Snap Split",
  description: "Claim your items and see what you owe, live.",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SessionClient sessionId={id} />;
}
