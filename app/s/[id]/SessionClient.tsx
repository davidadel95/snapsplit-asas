"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  ensureAnonymousUser,
  getDb,
  isFirebaseConfigured,
} from "@/lib/firebase";
import {
  computeBreakdowns,
  colorForIndex,
  formatMoney,
  quantityForParticipant,
  remainingQuantity,
  type LiveSession,
  type SessionClaim,
  type SessionItem,
  type SessionParticipant,
} from "@/lib/session";

const BG = "#2D4B42";
const APP_STORE_URL =
  "https://apps.apple.com/eg/app/snap-split-bill-splitter/id6749791093";

type Phase = "loading" | "needsConfig" | "join" | "ready" | "notFound" | "error";

export default function SessionClient({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uid, setUid] = useState<string | null>(null);

  const [session, setSession] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [claims, setClaims] = useState<SessionClaim[]>([]);

  // Join form state
  const [nameInput, setNameInput] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [joining, setJoining] = useState(false);

  // Initialize anonymous auth + listeners.
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setPhase("needsConfig");
      return;
    }

    let unsubSession = () => {};
    let unsubParticipants = () => {};
    let unsubClaims = () => {};
    let cancelled = false;

    (async () => {
      try {
        const user = await ensureAnonymousUser();
        if (cancelled) return;
        setUid(user.uid);

        const db = getDb();
        const sessionRef = doc(db, "sessions", sessionId);

        unsubSession = onSnapshot(
          sessionRef,
          (snap) => {
            if (!snap.exists()) {
              setSession(null);
              setPhase("notFound");
              return;
            }
            const data = snap.data();
            setSession({
              id: snap.id,
              hostUserId: data.hostUserId,
              status: data.status,
              currency: data.currency ?? "EGP",
              items: (data.items ?? []) as SessionItem[],
              additionalCharges: data.additionalCharges ?? [],
              fixedCharges: data.fixedCharges ?? [],
              createdAt: data.createdAt ?? null,
              expiresAt: data.expiresAt,
            });
          },
          (err) => {
            setErrorMessage(err.message);
            setPhase("error");
          }
        );

        unsubParticipants = onSnapshot(
          collection(db, "sessions", sessionId, "participants"),
          (snap) => {
            setParticipants(
              snap.docs.map((d) => d.data() as SessionParticipant)
            );
          }
        );

        unsubClaims = onSnapshot(
          collection(db, "sessions", sessionId, "claims"),
          (snap) => {
            setClaims(
              snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SessionClaim, "id">) }))
            );
          }
        );
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      unsubSession();
      unsubParticipants();
      unsubClaims();
    };
  }, [sessionId]);

  // Derive phase from loaded data + whether we've joined.
  const hasJoined = useMemo(
    () => Boolean(uid && participants.some((p) => p.uid === uid)),
    [uid, participants]
  );

  useEffect(() => {
    if (phase === "needsConfig" || phase === "notFound" || phase === "error") return;
    if (!session) {
      setPhase("loading");
      return;
    }
    setPhase(hasJoined ? "ready" : "join");
  }, [session, hasJoined, phase]);

  // Pre-pick a free color when arriving at the join screen.
  useEffect(() => {
    if (phase === "join") {
      setColorIndex(participants.length);
    }
  }, [phase, participants.length]);

  const breakdowns = useMemo(
    () => (session ? computeBreakdowns(session, participants, claims) : []),
    [session, participants, claims]
  );
  const myBreakdown = breakdowns.find((b) => b.uid === uid);
  const isExpired = session ? session.expiresAt.toDate() < new Date() : false;
  const isSettled = session?.status === "settled";
  const readOnly = isSettled || isExpired;

  async function handleJoin() {
    if (!uid || !nameInput.trim()) return;
    setJoining(true);
    try {
      const db = getDb();
      await setDoc(doc(db, "sessions", sessionId, "participants", uid), {
        uid,
        displayName: nameInput.trim(),
        colorHex: colorForIndex(colorIndex),
        joinedAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not join.");
      setPhase("error");
    } finally {
      setJoining(false);
    }
  }

  async function setMyClaim(item: SessionItem, quantity: number) {
    if (!uid || !session || readOnly) return;
    const db = getDb();
    const ref = doc(db, "sessions", sessionId, "claims", `${uid}_${item.id}`);
    try {
      if (quantity <= 0) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { itemId: item.id, participantUid: uid, quantity });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not update claim.");
    }
  }

  // ---- Render states -------------------------------------------------------

  if (phase === "needsConfig") {
    return (
      <Centered>
        <Card>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Live sessions not configured</h1>
          <p className="text-gray-600 text-sm">
            Set the <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables to enable
            real-time bill splitting.
          </p>
        </Card>
      </Centered>
    );
  }

  if (phase === "loading") {
    return (
      <Centered>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white/80">Loading your bill…</p>
        </div>
      </Centered>
    );
  }

  if (phase === "notFound") {
    return (
      <Centered>
        <Card>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Bill not found</h1>
          <p className="text-gray-600 text-sm mb-6">
            This link may have expired or been settled. Ask the host for a new one.
          </p>
          <DownloadButton />
        </Card>
      </Centered>
    );
  }

  if (phase === "error") {
    return (
      <Centered>
        <Card>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 text-sm break-words">{errorMessage}</p>
        </Card>
      </Centered>
    );
  }

  if (phase === "join") {
    return (
      <Centered>
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Join the split</h1>
          <p className="text-gray-600 text-sm mb-6">
            Enter your name so everyone knows whose items are whose.
          </p>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D4B42]"
          />
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: 8 }).map((_, i) => {
              const c = colorForIndex(i);
              return (
                <button
                  key={i}
                  onClick={() => setColorIndex(i)}
                  aria-label={`Pick color ${i + 1}`}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    transform: i === colorIndex ? "scale(1.2)" : "scale(1)",
                    outline: i === colorIndex ? "2px solid #2D4B42" : "none",
                    outlineOffset: 2,
                  }}
                />
              );
            })}
          </div>
          <button
            onClick={handleJoin}
            disabled={!nameInput.trim() || joining}
            className="w-full bg-[#2D4B42] text-white font-semibold rounded-lg py-3 disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join split"}
          </button>
        </Card>
      </Centered>
    );
  }

  // phase === "ready"
  if (!session) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="max-w-2xl mx-auto p-4 pb-32">
        <header className="text-white py-4">
          <h1 className="text-2xl font-bold">Split the bill</h1>
          <p className="text-white/70 text-sm">
            {participants.length} {participants.length === 1 ? "person" : "people"} here
            {readOnly ? " · settled" : " · tap items to claim your share"}
          </p>
        </header>

        {/* Participant avatars */}
        <div className="flex flex-wrap gap-2 mb-4">
          {participants.map((p) => (
            <div
              key={p.uid}
              className="flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-3 py-1"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: p.colorHex }}
              >
                {(p.displayName || "?").slice(0, 2).toUpperCase()}
              </span>
              <span className="text-white text-sm">
                {p.uid === uid ? "You" : p.displayName}
              </span>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {session.items.map((item) => {
            const mine = quantityForParticipant(item.id, uid ?? "", claims);
            const remaining = remainingQuantity(item, claims);
            const othersClaimed = item.originalQuantity - remaining - mine;
            const maxForMe = Math.max(0, item.originalQuantity - othersClaimed);
            const claimers = claims.filter((c) => c.itemId === item.id && c.quantity > 0);
            return (
              <div key={item.id} className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      {formatMoney(item.totalPrice, session.currency)}
                      {item.originalQuantity > 1 ? ` · qty ${item.originalQuantity}` : ""}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: remaining < 0.001 ? "#E6F7F0" : "#FDECEC",
                      color: remaining < 0.001 ? "#00875A" : "#C0392B",
                    }}
                  >
                    {remaining < 0.001 ? "Fully claimed" : `${trim(remaining)} left`}
                  </span>
                </div>

                {/* Who claimed */}
                {claimers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {claimers.map((c) => {
                      const p = participants.find((x) => x.uid === c.participantUid);
                      return (
                        <span
                          key={c.id}
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: p?.colorHex ?? "#888" }}
                        >
                          {(c.participantUid === uid ? "You" : p?.displayName ?? "?")} ·{" "}
                          {trim(c.quantity)}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Claim controls */}
                {!readOnly && (
                  <div className="flex items-center gap-2 mt-3">
                    <Stepper
                      value={mine}
                      max={maxForMe}
                      onChange={(v) => setMyClaim(item, v)}
                    />
                    {remaining > 0.001 && (
                      <button
                        onClick={() => setMyClaim(item, mine + remaining)}
                        className="text-sm font-medium text-[#2D4B42] underline"
                      >
                        Claim remaining
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Everyone's totals */}
        <h2 className="text-white font-semibold mt-6 mb-2">Who owes what</h2>
        <div className="space-y-2">
          {breakdowns.map((b) => (
            <div
              key={b.uid}
              className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: b.colorHex }}
                />
                <span className="text-white">
                  {b.uid === uid ? "You" : b.displayName}
                </span>
              </div>
              <span className="text-white font-semibold">
                {formatMoney(b.total, session.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky "you owe" bar */}
      {myBreakdown && (
        <div className="fixed bottom-0 inset-x-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
            <span className="text-gray-600">You owe</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatMoney(myBreakdown.total, session.currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Small UI helpers ------------------------------------------------------

function Stepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(0, round(value - 1)));
  const inc = () => onChange(Math.min(max, round(value + 1)));
  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={dec}
        disabled={value <= 0}
        className="px-3 py-1 text-lg text-gray-700 disabled:opacity-30"
        aria-label="Claim one less"
      >
        −
      </button>
      <span className="px-3 min-w-[2.5rem] text-center text-gray-900">{trim(value)}</span>
      <button
        onClick={inc}
        disabled={value >= max - 0.001}
        className="px-3 py-1 text-lg text-gray-700 disabled:opacity-30"
        aria-label="Claim one more"
      >
        +
      </button>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: BG }}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      {children}
    </div>
  );
}

function DownloadButton() {
  return (
    <button
      onClick={() => window.open(APP_STORE_URL, "_blank")}
      className="mx-auto block hover:opacity-80 transition-opacity"
      aria-label="Download Snap Split on the App Store"
    >
      <img src="/app-store-badge.webp" alt="Download on the App Store" className="h-14 w-auto" />
    </button>
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function trim(n: number): string {
  return n === Math.round(n) ? String(Math.round(n)) : n.toFixed(2);
}
