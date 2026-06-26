// app/admin/feedback/page.tsx
// Server component — middleware already guards this route with gallery_session cookie.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FeedbackDashboard from "./FeedbackDashboard";

export const metadata = { title: "Feedback — SnapSplit Admin" };

export default async function AdminFeedbackPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("gallery_session");

  if (session?.value !== "authenticated_user_token") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#0a1a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4ade80]">Feedback Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">User submissions from the SnapSplit iOS app</p>
        </div>
        <FeedbackDashboard />
      </div>
    </main>
  );
}
