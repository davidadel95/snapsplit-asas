// Analytics helper for SnapSplit web.
//
// Dual-logs every event to:
//   • Firebase Analytics (GA4) — same project as the iOS app
//   • Amplitude           — same API key as the iOS app (NEXT_PUBLIC_AMPLITUDE_API_KEY)
//
// All functions are no-ops when the respective SDK is not configured, so
// callers never need to guard against missing config.

import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  type Analytics,
} from "firebase/analytics";
import { isFirebaseConfigured } from "./firebase";
import { initializeApp, getApps, getApp } from "firebase/app";
import * as amplitude from "@amplitude/analytics-browser";

// ─── Firebase ────────────────────────────────────────────────────────────────

let firebaseAnalytics: Analytics | null = null;

function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null; // SSR guard
  if (!isFirebaseConfigured()) return null;
  if (firebaseAnalytics) return firebaseAnalytics;
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    firebaseAnalytics = getAnalytics(app);
    return firebaseAnalytics;
  } catch {
    return null;
  }
}

// ─── Amplitude ───────────────────────────────────────────────────────────────

let amplitudeInitialised = false;

function getAmplitude(): typeof amplitude | null {
  if (typeof window === "undefined") return null; // SSR guard
  const key = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!key) return null;
  if (!amplitudeInitialised) {
    amplitude.init(key, {
      defaultTracking: false, // we log explicit events only, matching iOS behaviour
    });
    amplitudeInitialised = true;
  }
  return amplitude;
}

// ─── Unified log ─────────────────────────────────────────────────────────────

function log(eventName: string, params?: Record<string, unknown>) {
  // Firebase
  try {
    const fb = getFirebaseAnalytics();
    if (fb) firebaseLogEvent(fb, eventName, params);
  } catch {
    // never throw from analytics
  }

  // Amplitude
  try {
    const amp = getAmplitude();
    if (amp) amp.track(eventName, params);
  } catch {
    // never throw from analytics
  }
}

// ─── Session page events ──────────────────────────────────────────────────────

/** Fired when the user navigates to a /s/[id] share link. */
export function logDeepLinkOpened(sessionId: string) {
  log("web_deep_link_opened", { session_id: sessionId });
}

/** Fired once the session Firestore snapshot resolves successfully. */
export function logSessionLoaded(
  sessionId: string,
  itemCount: number,
  currency: string,
  loadTimeMs: number
) {
  log("web_session_loaded", {
    session_id: sessionId,
    item_count: itemCount,
    currency,
    load_time_ms: Math.round(loadTimeMs),
  });
}

/** Fired when the session is not found (expired or invalid link). */
export function logSessionNotFound(sessionId: string) {
  log("web_session_not_found", { session_id: sessionId });
}

/** Fired on any unrecoverable Firebase error on the session page. */
export function logSessionError(sessionId: string, message: string) {
  log("web_session_error", {
    session_id: sessionId,
    error_message: message.slice(0, 100),
  });
}

// ─── Participation events ─────────────────────────────────────────────────────

/** Fired when a new participant successfully joins a session. */
export function logSessionJoined(sessionId: string, participantCount: number) {
  log("web_session_joined", {
    session_id: sessionId,
    participant_count: participantCount,
  });
}

// ─── Item assignment events ───────────────────────────────────────────────────

/** Fired when the user taps an item row to open the claim sheet. */
export function logItemAssignmentOpened(itemName: string) {
  log("web_item_assignment_opened", { item_name: itemName });
}

/** Fired when the user confirms a "my share" claim on an item. */
export function logItemAssigned(
  itemName: string,
  mode: "mine" | "custom",
  quantity: number,
  sessionId: string
) {
  log("web_item_assigned", {
    item_name: itemName,
    assignment_mode: mode,
    quantity,
    session_id: sessionId,
  });
}

/** Fired when a claim is removed (quantity set to 0). */
export function logItemClaimCleared(itemName: string, sessionId: string) {
  log("web_item_claim_cleared", {
    item_name: itemName,
    session_id: sessionId,
  });
}

// ─── Review events ────────────────────────────────────────────────────────────

/** Fired when the user opens the "Review Bill" bottom sheet. */
export function logReviewBillOpened(
  sessionId: string,
  assignedCount: number,
  totalCount: number
) {
  log("web_review_bill_opened", {
    session_id: sessionId,
    assigned_count: assignedCount,
    total_count: totalCount,
  });
}

// ─── App Store CTA ────────────────────────────────────────────────────────────

/** Fired when the user taps any "Open App" / "Get App" link. */
export function logAppStoreTapped(source: "header" | "join_screen" | "not_found") {
  log("web_app_store_tapped", { source });
}
