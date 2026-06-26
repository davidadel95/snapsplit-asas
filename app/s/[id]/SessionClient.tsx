"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  billTotal,
  colorForIndex,
  COLOR_PALETTE,
  formatMoney,
  quantityForParticipant,
  remainingQuantity,
  type LiveSession,
  type PersonBreakdown,
  type SessionClaim,
  type SessionItem,
  type SessionParticipant,
} from "@/lib/session";

const APP_STORE_URL =
  "https://apps.apple.com/eg/app/snap-split-bill-splitter/id6749791093";

// ─── Brand colours ─────────────────────────────────────────────────────────
const C = {
  primary:          "#16342c",
  primaryContainer: "#2d4b42",
  surface:          "#faf9f7",
  secondary:        "#266b42",
  secondaryContainer: "#abf3bf",
  onSecondaryContainer: "#2d7148",
  onSurface:        "#1a1c1b",
  onSurfaceVariant: "#414845",
  outlineVariant:   "#c1c8c4",
  surfaceContainerHigh: "#e8e8e6",
  surfaceContainerLow: "#f4f3f1",
  secondaryFixed:   "#abf3bf",
  secondaryFixedDim:"#90d6a4",
  error:            "#ba1a1a",
} as const;

type Phase = "loading" | "needsConfig" | "join" | "ready" | "notFound" | "error";

// ─── Main component ─────────────────────────────────────────────────────────
export default function SessionClient({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [claims, setClaims] = useState<SessionClaim[]>([]);

  // Join form
  const [nameInput, setNameInput] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [joining, setJoining] = useState(false);

  // Sheet state
  const [selectedItem, setSelectedItem] = useState<SessionItem | null>(null);
  const [claimQty, setClaimQty] = useState(0);
  const [maxClaimQty, setMaxClaimQty] = useState(0); // snapshotted at sheet open — never drifts
  const [reviewOpen, setReviewOpen] = useState(false);
  // Custom split mode
  type ClaimMode = "mine" | "custom";
  const [claimMode, setClaimMode] = useState<ClaimMode>("mine");
  const [customShares, setCustomShares] = useState<Record<string, number>>({});

  // ── Firebase listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured()) { setPhase("needsConfig"); return; }

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

        unsubSession = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
          if (!snap.exists()) { setSession(null); setPhase("notFound"); return; }
          const d = snap.data();
          setSession({
            id: snap.id,
            hostUserId: d.hostUserId,
            status: d.status,
            currency: d.currency ?? "EGP",
            items: (d.items ?? []) as SessionItem[],
            additionalCharges: d.additionalCharges ?? [],
            fixedCharges: d.fixedCharges ?? [],
            createdAt: d.createdAt ?? null,
            expiresAt: d.expiresAt,
          });
        }, (err) => { setErrorMessage(err.message); setPhase("error"); });

        unsubParticipants = onSnapshot(
          collection(db, "sessions", sessionId, "participants"),
          (snap) => setParticipants(snap.docs.map((d) => d.data() as SessionParticipant)),
          (err) => { setErrorMessage(err.message); setPhase("error"); }
        );

        unsubClaims = onSnapshot(
          collection(db, "sessions", sessionId, "claims"),
          (snap) => setClaims(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SessionClaim, "id">) }))),
          (err) => { setErrorMessage(err.message); setPhase("error"); }
        );
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("error");
      }
    })();

    return () => { cancelled = true; unsubSession(); unsubParticipants(); unsubClaims(); };
  }, [sessionId]);

  // ── Derive phase ────────────────────────────────────────────────────────
  const hasJoined = useMemo(
    () => Boolean(uid && participants.some((p) => p.uid === uid)),
    [uid, participants]
  );

  useEffect(() => {
    if (phase === "needsConfig" || phase === "notFound" || phase === "error") return;
    if (!session) { setPhase("loading"); return; }
    setPhase(hasJoined ? "ready" : "join");
  }, [session, hasJoined, phase]);

  useEffect(() => {
    if (phase === "join") setColorIndex(participants.length);
  }, [phase, participants.length]);

  // ── Computed values ─────────────────────────────────────────────────────
  const breakdowns = useMemo(
    () => (session ? computeBreakdowns(session, participants, claims) : []),
    [session, participants, claims]
  );
  const myBreakdown = breakdowns.find((b) => b.uid === uid);
  const assignedItemCount = useMemo(
    () => session?.items.filter((item) => remainingQuantity(item, claims) < 0.001).length ?? 0,
    [session, claims]
  );
  const totalItems = session?.items.length ?? 0;

  // Items sorted: unassigned & partial first, fully-claimed last.
  const sortedItems = useMemo(
    () =>
      [...(session?.items ?? [])].sort((a, b) => {
        const aFull = remainingQuantity(a, claims) < 0.001;
        const bFull = remainingQuantity(b, claims) < 0.001;
        if (aFull !== bFull) return aFull ? 1 : -1;
        return 0;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.items, claims]
  );

  // Full bill total with all charges (mirrors iOS SplitCalculator.billTotal).
  const fullBillTotal = useMemo(() => (session ? billTotal(session) : 0), [session]);
  // Amount covered by current assignments (sum of all per-person totals).
  const assignedAmount = useMemo(
    () => breakdowns.reduce((sum, b) => sum + b.total, 0),
    [breakdowns]
  );
  // Remaining = full bill - what's already assigned, including proportional charges.
  const remainingTotal = Math.max(0, fullBillTotal - assignedAmount);

  const isExpired = session ? session.expiresAt.toDate() < new Date() : false;
  const isSettled = session?.status === "settled";
  const readOnly = isSettled || isExpired;

  // ── Actions ──────────────────────────────────────────────────────────────
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
    // Guard: never write more than the item's original quantity.
    const capped = Math.min(Math.max(0, quantity), item.originalQuantity);
    const db = getDb();
    const ref = doc(db, "sessions", sessionId, "claims", `${uid}_${item.id}`);
    try {
      if (capped <= 0) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { itemId: item.id, participantUid: uid, quantity: capped });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not update claim.");
    }
  }

  function openItemSheet(item: SessionItem) {
    if (readOnly) return;
    const mine = quantityForParticipant(item.id, uid ?? "", claims);
    const remaining = remainingQuantity(item, claims);
    setClaimQty(mine);
    setMaxClaimQty(mine + remaining);
    setClaimMode("mine");
    // Initialise custom shares from existing claims for this item.
    // Each claimer starts with shares proportional to their claimed quantity (rounded to int, min 1).
    const existingClaims = claims.filter((c) => c.itemId === item.id && c.quantity > 0);
    if (existingClaims.length > 0) {
      const initialShares: Record<string, number> = {};
      for (const c of existingClaims) {
        initialShares[c.participantUid] = Math.max(1, Math.round(c.quantity));
      }
      setCustomShares(initialShares);
    } else {
      // Default: current user gets 1 share
      setCustomShares(uid ? { [uid]: 1 } : {});
    }
    setSelectedItem(item);
  }

  async function confirmClaim() {
    if (!selectedItem) return;
    // Re-validate against live claims at confirm time (guards race conditions).
    const othersTotal = claims
      .filter((c) => c.itemId === selectedItem.id && c.participantUid !== uid)
      .reduce((sum, c) => sum + c.quantity, 0);
    const maxAllowed = Math.max(0, selectedItem.originalQuantity - othersTotal);
    const safeQty = Math.min(claimQty, maxAllowed);
    await setMyClaim(selectedItem, safeQty);
    setSelectedItem(null);
  }

  async function confirmCustomSplit() {
    if (!selectedItem || !session) return;
    const totalShares = Object.values(customShares).reduce((s, v) => s + v, 0);
    if (totalShares <= 0) return;
    const db = getDb();
    try {
      await Promise.all(
        participants.map((p) => {
          const shares = customShares[p.uid] ?? 0;
          const qty = (shares / totalShares) * selectedItem.originalQuantity;
          const ref = doc(db, "sessions", sessionId, "claims", `${p.uid}_${selectedItem.id}`);
          if (qty < 0.0001) {
            return deleteDoc(ref).catch(() => {/* already deleted */});
          }
          return setDoc(ref, { itemId: selectedItem.id, participantUid: p.uid, quantity: qty });
        })
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not save split.");
    }
    setSelectedItem(null);
  }

  // ─── Phase screens ────────────────────────────────────────────────────────
  if (phase === "needsConfig") {
    return (
      <FullPage>
        <StatusCard title="Not configured" message="Set the NEXT_PUBLIC_FIREBASE_* environment variables to enable live sessions." />
      </FullPage>
    );
  }
  if (phase === "loading") {
    return (
      <FullPage>
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Loading your bill…</p>
        </div>
      </FullPage>
    );
  }
  if (phase === "notFound") {
    return (
      <FullPage>
        <StatusCard
          title="Bill not found"
          message="This link may have expired or already been settled. Ask the host for a new one."
          cta={{ label: "Get the App", href: APP_STORE_URL }}
        />
      </FullPage>
    );
  }
  if (phase === "error") {
    return (
      <FullPage>
        <StatusCard title="Something went wrong" message={errorMessage} />
      </FullPage>
    );
  }

  // ─── Join screen ──────────────────────────────────────────────────────────
  if (phase === "join") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.surface }}>
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 h-14 sticky top-0 z-10"
          style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.outlineVariant}` }}
        >
          <div className="flex items-center gap-2">
            <img src="/snap-split-logo.png" alt="Snap Split" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold" style={{ color: C.primary }}>Snap Split</span>
          </div>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
            style={{ color: C.primary, backgroundColor: C.surfaceContainerHigh }}
          >
            Open App
          </a>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Invite card */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-[16px] mx-auto mb-4 shadow-lg overflow-hidden"
              >
                <img src="/snap-split-logo.png" alt="Snap Split" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: C.primary }}>
                You&apos;re invited!
              </h1>
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                Enter your name so your group knows whose items are whose.
              </p>
            </div>

            {/* Name input */}
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !joining && nameInput.trim() && handleJoin()}
              placeholder="Your name"
              maxLength={40}
              className="w-full rounded-xl px-4 py-3 mb-4 text-base outline-none transition-all"
              style={{
                backgroundColor: C.surfaceContainerLow,
                border: `1.5px solid ${nameInput.trim() ? C.primary : C.outlineVariant}`,
                color: C.onSurface,
              }}
            />

            {/* Color picker */}
            <p className="text-xs font-semibold mb-2" style={{ color: C.onSurfaceVariant }}>
              Pick your colour
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {COLOR_PALETTE.slice(0, 8).map((color, i) => (
                <button
                  key={i}
                  onClick={() => setColorIndex(i)}
                  className="w-9 h-9 rounded-full transition-transform focus:outline-none"
                  style={{
                    backgroundColor: color,
                    transform: i === colorIndex ? "scale(1.2)" : "scale(1)",
                    outline: i === colorIndex ? `3px solid ${C.primary}` : "none",
                    outlineOffset: 2,
                  }}
                  aria-label={`Color option ${i + 1}`}
                />
              ))}
            </div>

            {/* Join CTA */}
            <button
              onClick={handleJoin}
              disabled={!nameInput.trim() || joining}
              className="w-full h-14 rounded-full font-bold text-base text-white transition-all active:scale-95"
              style={{
                backgroundColor: nameInput.trim() && !joining ? C.primary : C.outlineVariant,
                cursor: nameInput.trim() && !joining ? "pointer" : "not-allowed",
              }}
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <SmallSpinner /> Joining…
                </span>
              ) : (
                "Join Session"
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Ready / SplitHub ─────────────────────────────────────────────────────
  if (!session) return null;

  const progressPct = totalItems > 0 ? (assignedItemCount / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.surface }}>
      {/* Sticky top nav */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(250,249,247,0.85)",
          borderBottom: `1px solid ${C.outlineVariant}`,
        }}
      >
        {/* Left placeholder to balance center title */}
        <div className="w-10" />
        <h1 className="font-bold text-lg" style={{ color: C.primary }}>
          Snap Split
        </h1>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
          style={{ color: C.primary, backgroundColor: C.surfaceContainerHigh }}
        >
          Open App
        </a>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 px-4 pb-40 max-w-2xl mx-auto w-full">
        {/* ── Progress card ── */}
        <section
          className="mt-4 rounded-[20px] p-5"
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(22,52,44,0.05)",
          }}
        >
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: C.onSurfaceVariant }}>
                Progress
              </p>
              <p className="text-xl font-bold" style={{ color: C.primary }}>
                {assignedItemCount} / {totalItems} items claimed
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>Remaining</p>
              <p className="text-lg font-bold" style={{ color: C.primary }}>
                {formatMoney(remainingTotal, session.currency)}
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${C.secondaryFixed}50` }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, backgroundColor: C.secondary }}
            />
          </div>
        </section>

        {/* ── Participant avatars ── */}
        <section className="mt-6 flex gap-4 overflow-x-auto hide-scrollbar py-2">
          {participants.map((p) => (
            <div key={p.uid} className="flex flex-col items-center flex-shrink-0">
              <Avatar name={p.displayName} color={p.colorHex} size={52} />
              <span className="text-xs mt-1 font-semibold" style={{ color: p.uid === uid ? C.primary : C.onSurfaceVariant }}>
                {p.uid === uid ? "You" : p.displayName.split(" ")[0]}
              </span>
            </div>
          ))}
        </section>

        {/* ── Settled / expired banner ── */}
        {readOnly && (
          <div
            className="mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-center"
            style={{ backgroundColor: "#fef3cd", color: "#856404" }}
          >
            {isSettled ? "This bill has been settled." : "This session has expired."}
          </div>
        )}

        {/* ── Items ── */}
        <div className="mt-6 flex justify-between items-center px-1 mb-3">
          <h2 className="text-xl font-bold" style={{ color: C.primary }}>Items</h2>
        </div>

        <div className="space-y-3">
          {sortedItems.map((item) => {
            const mine = quantityForParticipant(item.id, uid ?? "", claims);
            const remaining = remainingQuantity(item, claims);
            const fullyAssigned = remaining < 0.001;
            const claimers = claims.filter((c) => c.itemId === item.id && c.quantity > 0);

            return (
              <div
                key={item.id}
                className="rounded-[20px] p-5 cursor-pointer transition-all"
                style={{
                  backgroundColor: "#fff",
                  border: fullyAssigned
                    ? `2px solid ${C.secondaryFixedDim}`
                    : `2px dashed ${C.error}`,
                  boxShadow: "0 2px 15px rgba(22,52,44,0.04)",
                }}
                onClick={() => openItemSheet(item)}
              >
                {/* Item header */}
                <div className="flex justify-between items-start">
                  <div className="min-w-0 mr-3">
                    <h4 className="font-semibold text-base truncate" style={{ color: C.primary }}>
                      {item.name}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                      {item.originalQuantity > 1 ? `Qty ${item.originalQuantity} · ` : ""}{formatMoney(item.totalPrice, session.currency)}
                    </p>
                    <p
                      className="text-xs font-semibold mt-0.5"
                      style={{ color: fullyAssigned ? C.secondary : C.error }}
                    >
                      {fullyAssigned ? "Fully claimed" : claimers.length > 0 ? `${trim(remaining)} left` : "Unassigned"}
                    </p>
                  </div>
                  <span className="text-lg font-bold flex-shrink-0" style={{ color: C.primary }}>
                    {formatMoney(item.totalPrice, session.currency)}
                  </span>
                </div>

                {/* Who claimed */}
                {claimers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {claimers.map((c) => {
                      const p = participants.find((x) => x.uid === c.participantUid);
                      return (
                        <span
                          key={c.id}
                          className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{ backgroundColor: p?.colorHex ?? "#888" }}
                        >
                          {c.participantUid === uid ? "You" : (p?.displayName ?? "?")} · {formatMoney((c.quantity / item.originalQuantity) * item.totalPrice, session.currency)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Breakdowns ── */}
        {breakdowns.length > 0 && (
          <>
            <h2 className="text-xl font-bold mt-8 mb-3" style={{ color: C.primary }}>Who owes what</h2>
            <div className="space-y-2">
              {breakdowns.map((b) => (
                <div
                  key={b.uid}
                  className="flex justify-between items-center rounded-xl px-4 py-3"
                  style={{ backgroundColor: b.uid === uid ? C.primaryContainer : C.surfaceContainerHigh }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={b.displayName} color={b.colorHex} size={28} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: b.uid === uid ? "#fff" : C.onSurface }}
                    >
                      {b.uid === uid ? "You" : b.displayName}
                    </span>
                  </div>
                  <span
                    className="font-bold"
                    style={{ color: b.uid === uid ? "#fff" : C.onSurface }}
                  >
                    {formatMoney(b.total, session.currency)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Sticky "You owe" bar ── */}
      {myBreakdown && (
        <div
          className="fixed z-40"
          style={{ bottom: "0", left: 0, right: 0 }}
        >
          <div className="max-w-2xl mx-auto px-4 pb-4 pt-2">
            <div
              className="flex justify-between items-center rounded-2xl p-4"
              style={{
                backgroundColor: C.primary,
                boxShadow: "0 -4px 20px rgba(22,52,44,0.15)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: C.primaryContainer }}
                >
                  <ReceiptIcon />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70 text-white">Your Total</p>
                  <p className="text-base font-bold text-white">You owe {formatMoney(myBreakdown.total, session.currency)}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewOpen(true)}
                className="font-bold text-sm rounded-xl px-5 py-2.5 active:scale-95 transition-all"
                style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}
              >
                Review Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Item claim bottom sheet ── */}
      {selectedItem && (
        <BottomSheet onClose={() => setSelectedItem(null)}>
          <div>
            {/* Item header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: C.primary }}>{selectedItem.name}</h3>
                <p className="text-sm mt-0.5" style={{ color: C.onSurfaceVariant }}>
                  {formatMoney(selectedItem.totalPrice, session.currency)}
                  {selectedItem.originalQuantity > 1 ? ` · qty ${selectedItem.originalQuantity}` : ""}
                </p>
              </div>
            </div>

            {/* Mode picker */}
            <div
              className="flex rounded-xl p-1 mb-5"
              style={{ backgroundColor: C.surfaceContainerHigh }}
            >
              {(["mine", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setClaimMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: claimMode === m ? "#fff" : "transparent",
                    color: claimMode === m ? C.primary : C.onSurfaceVariant,
                    boxShadow: claimMode === m ? "0 1px 4px rgba(22,52,44,0.12)" : "none",
                  }}
                >
                  {m === "mine" ? "My share" : "Custom split"}
                </button>
              ))}
            </div>

            {claimMode === "mine" ? (
              <>
                {/* Qty stepper */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold" style={{ color: C.onSurfaceVariant }}>Your quantity</span>
                  <ClaimStepper value={claimQty} max={maxClaimQty} onChange={setClaimQty} />
                </div>
                {claimQty < maxClaimQty && (
                  <button
                    onClick={() => setClaimQty(maxClaimQty)}
                    className="w-full text-sm font-semibold py-2 mb-4 rounded-xl transition-colors"
                    style={{ color: C.secondary, backgroundColor: `${C.secondaryContainer}60` }}
                  >
                    Claim all remaining ({trim(maxClaimQty - claimQty)})
                  </button>
                )}
                <button
                  onClick={confirmClaim}
                  className="w-full h-12 rounded-full font-bold text-white transition-all active:scale-95"
                  style={{ backgroundColor: C.primary }}
                >
                  Confirm
                </button>
              </>
            ) : (
              <>
                {/* Custom split — shares per participant */}
                <div className="space-y-3 mb-4">
                  {participants.map((p) => {
                    const shares = customShares[p.uid] ?? 0;
                    const totalShares = Object.values(customShares).reduce((s, v) => s + v, 0);
                    const price =
                      totalShares > 0
                        ? (shares / totalShares) * selectedItem.totalPrice
                        : 0;
                    const isMe = p.uid === uid;
                    return (
                      <div
                        key={p.uid}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5"
                        style={{
                          backgroundColor: isMe ? `${C.primaryContainer}22` : C.surfaceContainerLow,
                          border: isMe ? `1.5px solid ${C.primaryContainer}` : "none",
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={p.displayName} color={p.colorHex} size={32} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: C.onSurface }}>
                              {isMe ? "You" : p.displayName}
                            </p>
                            {shares > 0 && (
                              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                                {formatMoney(price, session.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                        <ShareStepper
                          value={shares}
                          onChange={(v) =>
                            setCustomShares((prev) => ({ ...prev, [p.uid]: v }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Coverage summary */}
                {(() => {
                  const totalShares = Object.values(customShares).reduce((s, v) => s + v, 0);
                  const coveredCount = Object.values(customShares).filter((v) => v > 0).length;
                  return totalShares > 0 ? (
                    <p className="text-xs text-center mb-3" style={{ color: C.onSurfaceVariant }}>
                      Split among {coveredCount} {coveredCount === 1 ? "person" : "people"}
                      {" · "}total {formatMoney(selectedItem.totalPrice, session.currency)}
                    </p>
                  ) : null;
                })()}

                <button
                  onClick={confirmCustomSplit}
                  disabled={Object.values(customShares).reduce((s, v) => s + v, 0) <= 0}
                  className="w-full h-12 rounded-full font-bold text-white transition-all active:scale-95"
                  style={{
                    backgroundColor:
                      Object.values(customShares).reduce((s, v) => s + v, 0) > 0
                        ? C.primary
                        : C.outlineVariant,
                  }}
                >
                  Confirm Split
                </button>
              </>
            )}
          </div>
        </BottomSheet>
      )}

      {/* ── Review bill bottom sheet ── */}
      {reviewOpen && session && (
        <BottomSheet onClose={() => setReviewOpen(false)}>
          <ReviewSheet
            breakdowns={breakdowns}
            currency={session.currency}
            uid={uid ?? ""}
          />
        </BottomSheet>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ name, color, size }: { name: string; color: string; size: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.32 }}
    >
      {initials}
    </div>
  );
}

function ClaimStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden"
      style={{ border: `1.5px solid ${C.outlineVariant}` }}
    >
      <button
        onClick={() => onChange(Math.max(0, round(value - 1)))}
        disabled={value <= 0}
        className="px-4 py-2 text-lg font-bold transition-colors"
        style={{ color: value <= 0 ? C.outlineVariant : C.primary }}
      >
        −
      </button>
      <span
        className="px-3 min-w-[2.5rem] text-center font-semibold"
        style={{ color: C.onSurface }}
      >
        {trim(value)}
      </span>
      <button
        onClick={() => onChange(Math.min(max, round(value + 1)))}
        disabled={value >= max - 0.001}
        className="px-4 py-2 text-lg font-bold transition-colors"
        style={{ color: value >= max - 0.001 ? C.outlineVariant : C.primary }}
      >
        +
      </button>
    </div>
  );
}

// Integer share stepper for custom split (no upper bound)
function ShareStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden flex-shrink-0"
      style={{ border: `1.5px solid ${C.outlineVariant}` }}
    >
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        className="px-3 py-1.5 text-lg font-bold transition-colors"
        style={{ color: value <= 0 ? C.outlineVariant : C.primary }}
      >
        −
      </button>
      <span
        className="px-3 min-w-[2rem] text-center font-semibold text-sm"
        style={{ color: C.onSurface }}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="px-3 py-1.5 text-lg font-bold transition-colors"
        style={{ color: C.primary }}
      >
        +
      </button>
    </div>
  );
}

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: "rgba(22,52,44,0.5)" }}
      onClick={handleBackdrop}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-2xl rounded-t-[32px] px-6 pt-4 pb-8"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div
          className="w-12 h-1.5 rounded-full mx-auto mb-6"
          style={{ backgroundColor: C.outlineVariant }}
        />
        {children}
      </div>
    </div>
  );
}

function ReviewSheet({
  breakdowns,
  currency,
  uid,
}: {
  breakdowns: PersonBreakdown[];
  currency: string;
  uid: string;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-6" style={{ color: C.primary }}>Bill Breakdown</h3>
      <div className="space-y-4">
        {breakdowns.map((b) => (
          <div key={b.uid}>
            <div className="flex items-center gap-2 mb-2">
              <Avatar name={b.displayName} color={b.colorHex} size={28} />
              <span className="font-bold" style={{ color: C.primary }}>
                {b.uid === uid ? "You" : b.displayName}
              </span>
            </div>
            <div className="ml-9 space-y-1">
              {b.items.map((li) => (
                <div key={li.name} className="flex justify-between text-sm">
                  <span style={{ color: C.onSurfaceVariant }}><ItemLabel quantity={li.quantity} originalQuantity={li.originalQuantity} name={li.name} /></span>
                  <span style={{ color: C.onSurface }}>{formatMoney(li.price, currency)}</span>
                </div>
              ))}
              {b.serviceShare > 0.001 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: C.onSurfaceVariant }}>Service</span>
                  <span style={{ color: C.onSurface }}>{formatMoney(b.serviceShare, currency)}</span>
                </div>
              )}
              {b.vatShare > 0.001 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: C.onSurfaceVariant }}>VAT</span>
                  <span style={{ color: C.onSurface }}>{formatMoney(b.vatShare, currency)}</span>
                </div>
              )}
              {b.fixedShare > 0.001 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: C.onSurfaceVariant }}>Fixed charges</span>
                  <span style={{ color: C.onSurface }}>{formatMoney(b.fixedShare, currency)}</span>
                </div>
              )}
              <div
                className="flex justify-between text-sm font-bold pt-1 mt-1"
                style={{ borderTop: `1px solid ${C.outlineVariant}` }}
              >
                <span style={{ color: C.primary }}>Total</span>
                <span style={{ color: C.primary }}>{formatMoney(b.total, currency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: `linear-gradient(160deg, ${C.primary} 0%, #1f4a3a 55%, ${C.primaryContainer} 100%)` }}
    >
      {children}
    </div>
  );
}

function StatusCard({
  title,
  message,
  cta,
}: {
  title: string;
  message: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div
      className="rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: C.surfaceContainerHigh }}
      >
        <img src="/snap-split-logo.png" alt="" className="w-7 h-7 rounded-lg object-contain" />
      </div>
      <h1 className="text-xl font-bold mb-2" style={{ color: C.primary }}>{title}</h1>
      <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>{message}</p>
      {cta && (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-bold text-sm rounded-full px-6 py-3 text-white transition-colors"
          style={{ backgroundColor: C.primary }}
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
      style={{ borderColor: `rgba(255,255,255,0.3)`, borderTopColor: "rgba(255,255,255,0.9)" }}
    />
  );
}

function SmallSpinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "white" }}
    />
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <path d="M16 8H8M16 12H8M12 16H8" />
    </svg>
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function trim(n: number): string {
  return n === Math.round(n) ? String(Math.round(n)) : n.toFixed(2);
}

// Renders "item name", "2× item name", or "<b>2 shares</b> of item name"
function ItemLabel({ quantity, originalQuantity, name }: { quantity: number; originalQuantity: number; name: string }) {
  if (Math.abs(quantity - Math.round(quantity)) < 0.001) {
    const n = Math.round(quantity);
    return <>{n === 1 ? name : <><strong>{n}×</strong> {name}</>}</>;
  }
  const ratio = quantity / originalQuantity;
  for (let d = 2; d <= 24; d++) {
    const n = Math.round(ratio * d);
    if (n > 0 && Math.abs(n / d - ratio) < 0.01) {
      return <><strong>{n} share{n === 1 ? "" : "s"}</strong> of {name}</>;
    }
  }
  return <>{trim(quantity)}× {name}</>;
}

// Keep the string version for any non-JSX callers
function formatItemLabel(quantity: number, originalQuantity: number, name: string): string {
  if (Math.abs(quantity - Math.round(quantity)) < 0.001) {
    const n = Math.round(quantity);
    return n === 1 ? name : `${n}× ${name}`;
  }
  const ratio = quantity / originalQuantity;
  for (let d = 2; d <= 24; d++) {
    const n = Math.round(ratio * d);
    if (n > 0 && Math.abs(n / d - ratio) < 0.01) {
      return `${n} share${n === 1 ? "" : "s"} of ${name}`;
    }
  }
  return `${trim(quantity)}× ${name}`;
}
