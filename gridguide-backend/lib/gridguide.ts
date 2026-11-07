import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { kv, STATS } from "./store";

export const TZ = "America/Los_Angeles";
export const CONTACT = {
  emergency: "(800) 555-0111",
  service: "(800) 555-0100",
  medical: "(800) 555-0155",
  email: "help@brightvale-electric.example",
};

/* ------------------------------------------------------------------ auth */

/** Constant-time string comparison (avoids leaking the key through response timing). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Every agent-facing endpoint requires the shared API key in a header
 * (`x-api-key`, or `Authorization: Bearer`). Keys in URLs are not accepted because URLs end up in logs.
 */
export function unauthorized(req: Request): Response | null {
  const expected = process.env.GRIDGUIDE_API_KEY;
  if (!expected) {
    // Fail closed in production; allow local development without a key.
    return process.env.VERCEL_ENV === "production"
      ? json({ ok: false, error: "misconfigured", message: "Service is not configured." }, 503)
      : null;
  }
  const h = req.headers;
  const bearer = h.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const key = h.get("x-api-key") || bearer;
  if (key && safeEqual(key, expected)) return null;
  return json({ ok: false, error: "unauthorized", message: "Missing or invalid API key." }, 401);
}

function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

/** Fixed-window rate limit per client IP. Returns a 429 response when the limit is exceeded. */
export async function rateLimited(req: Request, bucket: string, limit: number, windowSeconds = 60): Promise<Response | null> {
  try {
    const slot = Math.floor(Date.now() / (windowSeconds * 1000));
    const n = await kv().hit(`gg:rl:${bucket}:${clientIp(req)}:${slot}`, windowSeconds);
    if (n > limit) {
      return json({ ok: false, error: "rate_limited", message: "Too many requests. Please wait a moment and try again." }, 429);
    }
  } catch {
    /* never block a customer because the limiter itself failed */
  }
  return null;
}

/** Wrap a route handler so unexpected failures return a friendly JSON error the agent can relay. */
export function guard(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    await connection(); // API responses are always request-time, never prerendered
    try {
      return await handler(req);
    } catch (err) {
      unstable_rethrow(err); // let Next.js internal control-flow errors through
      console.error("gridguide route error", err);
      return json(
        { ok: false, status: "error", message: "Our system is temporarily unavailable. Please try again shortly or call Customer Service at (800) 555-0100." },
        500,
      );
    }
  };
}

/* ----------------------------------------------------------------- input */

/** Merge query params, JSON body and form body so the eGain API node and Custom Actions can send data either way. */
export async function readInput(req: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  new URL(req.url).searchParams.forEach((v, k) => (out[k] = v));
  if (req.method !== "GET" && req.method !== "HEAD") {
    const text = await req.text().catch(() => "");
    if (text) {
      try {
        const body = JSON.parse(text);
        if (body && typeof body === "object") {
          for (const [k, v] of Object.entries(body)) {
            if (v !== null && v !== undefined) out[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
          }
        }
      } catch {
        new URLSearchParams(text).forEach((v, k) => (out[k] = v));
      }
    }
  }
  // trim, strip control characters, cap length, and drop unresolved template placeholders like "{{wsZip}}"
  for (const k of Object.keys(out)) {
    const v = out[k].replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 300);
    if (/^\{\{.*\}\}$/.test(v) || v === "") delete out[k];
    else out[k] = v;
  }
  return out;
}

export function pick(input: Record<string, string>, ...names: string[]): string | undefined {
  const lower = Object.fromEntries(Object.entries(input).map(([k, v]) => [k.toLowerCase(), v]));
  for (const n of names) {
    const v = lower[n.toLowerCase()];
    if (v) return v;
  }
  return undefined;
}

export function digits(s?: string): string {
  return (s || "").replace(/\D/g, "");
}

export function normZip(s?: string): string | undefined {
  const d = digits(s);
  return d.length >= 5 ? d.slice(0, 5) : undefined;
}

export function last4(s?: string): string | undefined {
  const d = digits(s);
  return d.length >= 4 ? d.slice(-4) : undefined;
}

export function maskPhone(s?: string): string {
  const l = last4(s);
  return l ? `***-${l}` : "unknown";
}

/* ------------------------------------------------------------- responses */

export function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", "access-control-allow-origin": "*" },
  });
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ----------------------------------------------------------------- time */

export function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** "today", "tomorrow", or a weekday name, in the utility's time zone. */
export function dayLabel(d: Date): string {
  const key = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: TZ });
  const today = key(new Date());
  const tomorrow = key(new Date(Date.now() + 86400_000));
  if (key(d) === today) return "today";
  if (key(d) === tomorrow) return "tomorrow";
  return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long" });
}

/** Round up to the next half hour, then add hours. */
export function etrFromNow(hours: number): Date {
  const d = new Date(Date.now() + hours * 3600_000);
  d.setUTCMinutes(d.getUTCMinutes() < 30 ? 30 : 60, 0, 0);
  return d;
}

export function ref(prefix: string): string {
  return `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
}

/* --------------------------------------------------------- outage model */

export interface Outage {
  outageId: string;
  zip: string;
  area: string;
  customersAffected: number;
  cause: string;
  etrHours: number | null; // null = Assessing
  crewStatus: string;
}

/** Fictional seeded outages for the demo service area. */
export const SEED_OUTAGES: Record<string, Outage> = {
  "90001": {
    outageId: "OUT-1042",
    zip: "90001",
    area: "Maple Heights",
    customersAffected: 1240,
    cause: "Storm damage to a main distribution line",
    etrHours: 3,
    crewStatus: "Crew on site making repairs",
  },
  "90004": {
    outageId: "OUT-1043",
    zip: "90004",
    area: "Riverside Park",
    customersAffected: 3860,
    cause: "Fallen trees on multiple lines after high winds",
    etrHours: null,
    crewStatus: "Crews assessing damage",
  },
  "90011": {
    outageId: "OUT-1044",
    zip: "90011",
    area: "Oak Grove",
    customersAffected: 214,
    cause: "Failed neighborhood transformer",
    etrHours: 1.5,
    crewStatus: "Crew dispatched",
  },
};

/** Special ZIPs to demonstrate error handling in eGain workflows. */
export const ERROR_ZIP = "90009"; // returns HTTP 500
export const TIMEOUT_ZIP = "90003"; // responds after 25 seconds

export function describeOutage(o: Outage) {
  const etr = o.etrHours === null ? null : etrFromNow(o.etrHours);
  const etrText = etr ? `${fmtTime(etr)} ${dayLabel(etr)}` : "Assessing (crews are still inspecting the damage)";
  return {
    status: "known",
    outageId: o.outageId,
    zip: o.zip,
    area: o.area,
    customersAffected: o.customersAffected,
    cause: o.cause,
    etr: etrText,
    crewStatus: o.crewStatus,
    message:
      `We already know about the outage in ${o.zip} (${o.area}). It affects about ${o.customersAffected.toLocaleString("en-US")} customers. ` +
      `Cause: ${o.cause.toLowerCase()}. ${o.crewStatus}. Estimated restoration: ${etrText}. This is an estimate and may change. ` +
      `You don't need to file another report. Restoration text alerts are available so we can tell you when power is back.`,
  };
}

/* ---------------------------------------------------------------- events */

export type EventType =
  | "outage_check"
  | "report_filed"
  | "duplicate_avoided"
  | "alert_signup"
  | "extension_approved"
  | "extension_review"
  | "extension_declined"
  | "callback_booked"
  | "priority_callback"
  | "email_handoff"
  | "safety_stop"
  | "api_error";

export async function logEvent(type: EventType, summary: string, data: Record<string, unknown> = {}) {
  const store = kv();
  const event = { id: ref("EV"), type, summary, data, at: new Date().toISOString() };
  await store.pushEvent(event as never, 200);
  await store.incr(STATS, type);
  return event;
}
