"use client";

// app/admin/feedback/FeedbackDashboard.tsx
// Client component that reads from Firestore and renders feedback entries.

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { getDb, ensureAnonymousUser } from "@/lib/firebase";

interface FeedbackEntry {
  id: string;
  type: "feedback" | "feature_request";
  message: string;
  stars?: number;
  appVersion?: string;
  deviceModel?: string;
  source?: string;
  timestamp?: Timestamp;
}

type Tab = "all" | "feedback" | "feature_request";

function StarRating({ stars }: { stars?: number }) {
  if (!stars) return null;
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
      <span className="text-gray-400 ml-1">({stars}/5)</span>
    </span>
  );
}

function EntryCard({ entry }: { entry: FeedbackEntry }) {
  const isFeedback = entry.type === "feedback";
  const dateStr = entry.timestamp
    ? entry.timestamp.toDate().toLocaleString()
    : "—";

  return (
    <div className="bg-[#111e14] border border-[#1a3020] rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            isFeedback
              ? "bg-[#1a4530] text-[#4ade80]"
              : "bg-[#1a3045] text-[#60a5fa]"
          }`}
        >
          {isFeedback ? "⭐ Feedback" : "💡 Feature Request"}
        </span>
        <span className="text-gray-500 text-xs shrink-0">{dateStr}</span>
      </div>

      {entry.stars !== undefined && <StarRating stars={entry.stars} />}

      <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
        {entry.message}
      </p>

      <div className="flex flex-wrap gap-3 pt-1">
        {entry.appVersion && (
          <span className="text-gray-500 text-xs">v{entry.appVersion}</span>
        )}
        {entry.deviceModel && (
          <span className="text-gray-500 text-xs">{entry.deviceModel}</span>
        )}
        {entry.source && (
          <span className="text-gray-500 text-xs">{entry.source}</span>
        )}
      </div>
    </div>
  );
}

export default function FeedbackDashboard() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        await ensureAnonymousUser();
        const db = getDb();
        const q = query(
          collection(db, "feedback"),
          orderBy("timestamp", "desc")
        );
        unsubscribe = onSnapshot(q, (snapshot) => {
          const data: FeedbackEntry[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<FeedbackEntry, "id">),
          }));
          setEntries(data);
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load feedback. Check Firebase config.");
        setLoading(false);
      }
    }

    init();
    return () => unsubscribe?.();
  }, []);

  const filtered =
    activeTab === "all"
      ? entries
      : entries.filter((e) => e.type === activeTab);

  const feedbackCount = entries.filter((e) => e.type === "feedback").length;
  const featureCount = entries.filter((e) => e.type === "feature_request").length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: entries.length },
    { id: "feedback", label: "⭐ Feedback", count: feedbackCount },
    { id: "feature_request", label: "💡 Feature Requests", count: featureCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ade80]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-900/30 border border-red-700 text-red-300 p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: entries.length, color: "text-white" },
          { label: "Feedback", value: feedbackCount, color: "text-[#4ade80]" },
          { label: "Feature Requests", value: featureCount, color: "text-[#60a5fa]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111e14] border border-[#1a3020] rounded-xl p-4 text-center"
          >
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#4ade80] text-black"
                : "bg-[#111e14] text-gray-400 hover:text-white border border-[#1a3020]"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No submissions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
