"use client";

import { AnalyticsEvent, AnalyticsEventName } from "@/types";

const STORAGE_KEY = "verdea_analytics_events";
const SESSION_KEY = "verdea_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function readEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Storage full or unavailable — fail silently, this is instrumentation only.
  }
}

export function track(
  eventName: AnalyticsEventName,
  opts?: {
    route?: string;
    payload?: Record<string, unknown>;
    productId?: string;
    priceQ?: number;
    configuratorStep?: string;
    // Callers may pass arbitrary contextual data; extra keys are folded
    // into `payload` so nothing is dropped.
    [key: string]: unknown;
  }
) {
  if (typeof window === "undefined") return;

  const { route, payload, productId, priceQ, configuratorStep, ...rest } =
    opts ?? {};

  const mergedPayload =
    payload || Object.keys(rest).length > 0
      ? { ...(payload ?? {}), ...rest }
      : undefined;

  const event: AnalyticsEvent = {
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    route: (route as string) ?? window.location.pathname,
    eventName,
    payload: mergedPayload,
    productId: productId as string | undefined,
    priceQ: priceQ as number | undefined,
    configuratorStep: configuratorStep as string | undefined,
  };
  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export function getAllEvents(): AnalyticsEvent[] {
  return readEvents();
}

export function clearEvents() {
  writeEvents([]);
}

export function exportEventsAsJson(): string {
  return JSON.stringify(readEvents(), null, 2);
}

export function exportEventsAsCsv(): string {
  const events = readEvents();
  if (events.length === 0) return "";
  const headers = [
    "timestamp",
    "sessionId",
    "route",
    "eventName",
    "productId",
    "priceQ",
    "configuratorStep",
    "payload",
  ];
  const rows = events.map((e) =>
    [
      e.timestamp,
      e.sessionId,
      e.route,
      e.eventName,
      e.productId ?? "",
      e.priceQ ?? "",
      e.configuratorStep ?? "",
      e.payload ? JSON.stringify(e.payload).replace(/"/g, "'") : "",
    ]
      .map((v) => `"${v}"`)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
