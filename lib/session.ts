// Shared TypeScript model for real-time collaborative sessions.
//
// These types mirror the Firestore documents written by the iOS app
// (see SnapSplit/Modules/Sessions/Models). The per-person total math is a
// faithful port of the app's realtime split calculation so amounts match
// across web and app to the cent.

import { Timestamp } from "firebase/firestore";

export type SessionStatus = "open" | "settled";

export interface SessionItem {
  id: string;
  name: string;
  totalPrice: number;
  originalQuantity: number;
}

export interface SessionAdditionalCharge {
  id: string;
  name: string;
  percentage: number;
}

export interface SessionFixedCharge {
  id: string;
  name: string;
  amount: number;
}

export interface LiveSession {
  id: string;
  hostUserId: string;
  status: SessionStatus;
  currency: string;
  items: SessionItem[];
  additionalCharges: SessionAdditionalCharge[];
  fixedCharges: SessionFixedCharge[];
  createdAt?: Timestamp | null;
  expiresAt: Timestamp;
}

export interface SessionParticipant {
  uid: string;
  displayName: string;
  colorHex: string;
  joinedAt?: Timestamp | null;
  lastSeenAt?: Timestamp | null;
}

export interface SessionClaim {
  id: string; // `${participantUid}_${itemId}`
  itemId: string;
  participantUid: string;
  quantity: number;
}

export function claimDocId(participantUid: string, itemId: string): string {
  return `${participantUid}_${itemId}`;
}

// ---- Per-person totals (port of BillSplitViewModel.calculateRealtimeTotals) ----

export interface PersonLineItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PersonBreakdown {
  uid: string;
  displayName: string;
  colorHex: string;
  items: PersonLineItem[];
  subtotal: number;
  serviceShare: number;
  vatShare: number;
  fixedShare: number;
  total: number;
}

function pricePerUnit(item: SessionItem): number {
  if (item.originalQuantity <= 0) return 0;
  return item.totalPrice / item.originalQuantity;
}

function categorizeCharges(charges: SessionAdditionalCharge[]): {
  vat: SessionAdditionalCharge[];
  service: SessionAdditionalCharge[];
} {
  const vat: SessionAdditionalCharge[] = [];
  const service: SessionAdditionalCharge[] = [];
  for (const c of charges) {
    const name = c.name.toLowerCase();
    if (
      name.includes("vat") ||
      name.includes("value added tax") ||
      name.includes("sales tax") ||
      name.includes("tax")
    ) {
      vat.push(c);
    } else if (name.includes("service")) {
      service.push(c);
    }
    // Other charges are intentionally ignored, matching the app.
  }
  return { vat, service };
}

/// Remaining unclaimed quantity for an item.
export function remainingQuantity(item: SessionItem, claims: SessionClaim[]): number {
  const claimed = claims
    .filter((c) => c.itemId === item.id)
    .reduce((sum, c) => sum + c.quantity, 0);
  return Math.max(0, item.originalQuantity - claimed);
}

/// Quantity a given participant has claimed for an item.
export function quantityForParticipant(
  itemId: string,
  uid: string,
  claims: SessionClaim[]
): number {
  return claims.find((c) => c.itemId === itemId && c.participantUid === uid)?.quantity ?? 0;
}

/// Computes each participant's running total from the live claim stream.
export function computeBreakdowns(
  session: LiveSession,
  participants: SessionParticipant[],
  claims: SessionClaim[]
): PersonBreakdown[] {
  if (participants.length === 0) return [];

  // Subtotal of items that have at least one claim (denominator for shares).
  const assignedSubtotal = session.items.reduce((sum, item) => {
    const hasClaim = claims.some((c) => c.itemId === item.id && c.quantity > 0);
    return hasClaim ? sum + item.totalPrice : sum;
  }, 0);

  const { vat, service } = categorizeCharges(session.additionalCharges);
  const totalService = service.reduce(
    (sum, c) => sum + assignedSubtotal * (c.percentage / 100),
    0
  );
  const totalVat = vat.reduce(
    (sum, c) => sum + (assignedSubtotal + totalService) * (c.percentage / 100),
    0
  );

  const totalFixed = session.fixedCharges.reduce((sum, c) => sum + c.amount, 0);
  const fixedPerPerson = totalFixed / participants.length;

  return participants.map((p) => {
    const lineItems: PersonLineItem[] = [];
    let subtotal = 0;
    for (const item of session.items) {
      const qty = quantityForParticipant(item.id, p.uid, claims);
      if (qty <= 0) continue;
      const price = pricePerUnit(item) * qty;
      subtotal += price;
      lineItems.push({ name: item.name, quantity: qty, price });
    }

    const proportion = assignedSubtotal > 0 ? subtotal / assignedSubtotal : 0;
    const serviceShare = totalService * proportion;
    const vatShare = totalVat * proportion;
    const total = subtotal + serviceShare + vatShare + fixedPerPerson;

    return {
      uid: p.uid,
      displayName: p.displayName,
      colorHex: p.colorHex,
      items: lineItems,
      subtotal,
      serviceShare,
      vatShare,
      fixedShare: fixedPerPerson,
      total,
    };
  });
}

// A palette mirroring the app's Person.colorPalette so colors feel consistent.
export const COLOR_PALETTE: string[] = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#F38181", "#AA96DA",
  "#FCBAD3", "#95E1D3", "#F6E58D", "#FF7979", "#6C5CE7",
  "#FD79A8", "#A29BFE", "#00B894", "#FDCB6E", "#FF7675",
  "#74B9FF",
];

export function colorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}
