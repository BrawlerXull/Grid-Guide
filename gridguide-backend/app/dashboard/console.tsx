"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  CalendarCheck,
  CalendarX,
  CopyCheck,
  ExternalLink,
  FilePlus,
  HeartPulse,
  Inbox,
  Mail,
  Pause,
  PhoneCall,
  Play,
  Scale,
  Search,
  ServerCrash,
  TriangleAlert,
} from "lucide-react";
import { CopyButton } from "../components/copy-button";
import { DEMO_URL, RULES } from "@/lib/site";

type Ev = { id: string; type: string; summary: string; at: string };
type Outage = { outageId: string; zip: string; area: string; customersAffected: number; cause: string; etr: string; crewStatus?: string };
type Feed = { events: Ev[]; stats: Record<string, number>; outages: Outage[]; storage: string };

type Group = "outage" | "safety" | "billing" | "handoff" | "system";

const TYPES: Record<string, { label: string; group: Group; icon: LucideIcon; tone: string }> = {
  outage_check: { label: "Outage check", group: "outage", icon: Search, tone: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100" },
  report_filed: { label: "Ticket filed", group: "outage", icon: FilePlus, tone: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100" },
  duplicate_avoided: { label: "Duplicate avoided", group: "outage", icon: CopyCheck, tone: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100" },
  alert_signup: { label: "Alerts on", group: "outage", icon: BellRing, tone: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" },
  safety_stop: { label: "Safety stop", group: "safety", icon: TriangleAlert, tone: "bg-red-700 text-white" },
  priority_callback: { label: "Medical priority", group: "safety", icon: HeartPulse, tone: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100" },
  extension_approved: { label: "Extension approved", group: "billing", icon: CalendarCheck, tone: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" },
  extension_review: { label: "Sent for review", group: "billing", icon: Scale, tone: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100" },
  extension_declined: { label: "Payment plan offered", group: "billing", icon: CalendarX, tone: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100" },
  callback_booked: { label: "Callback booked", group: "handoff", icon: PhoneCall, tone: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100" },
  email_handoff: { label: "Email to Care", group: "handoff", icon: Mail, tone: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100" },
  api_error: { label: "System error", group: "system", icon: ServerCrash, tone: "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100" },
};

const FILTERS: { id: "all" | Group; label: string }[] = [
  { id: "all", label: "All actions" },
  { id: "outage", label: "Outages" },
  { id: "safety", label: "Safety & medical" },
  { id: "billing", label: "Billing" },
  { id: "handoff", label: "Human handoff" },
  { id: "system", label: "System" },
];

const POLL_MS = 3000;

function timeAgo(iso: string, now: number) {
  if (!now) return "";
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s} seconds ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  return `${Math.floor(s / 3600)} h ago`;
}

export function Console() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<"all" | Group>("all");
  const [now, setNow] = useState(0);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");
  const seen = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/events", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const f: Feed = await r.json();
      const ids = new Set(f.events.map((e) => e.id));
      if (seen.current) {
        const added = f.events.filter((e) => !seen.current!.has(e.id));
        setFresh(new Set(added.map((e) => e.id)));
        if (added.length) {
          setAnnouncement(
            `${added.length} new ${added.length === 1 ? "action" : "actions"}: ${added
              .slice(0, 3)
              .map((e) => TYPES[e.type]?.label ?? e.type)
              .join(", ")}`,
          );
        }
      }
      seen.current = ids;
      setFeed(f);
      setError(false);
    } catch {
      setError(true);
    }
    setNow(Date.now());
  }, []);

  useEffect(() => {
    // first load, then poll while not paused and the tab is visible
    const first = setTimeout(load, 0);
    if (paused) return () => clearTimeout(first);
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [paused, load]);

  const stats = feed?.stats;
  const tiles = useMemo(() => {
    const s = stats ?? {};
    return [
      { label: "Outage tickets filed", value: s.report_filed ?? 0, note: "New outages reported by customers", icon: FilePlus },
      { label: "Duplicate reports avoided", value: s.duplicate_avoided ?? 0, note: "Known outages, no extra tickets", icon: CopyCheck },
      { label: "Restoration alert sign-ups", value: s.alert_signup ?? 0, note: "Customers who won't need to call back", icon: BellRing },
      { label: "Extensions auto-approved", value: s.extension_approved ?? 0, note: "Within the 14-day policy", icon: CalendarCheck },
      {
        label: "Handed to a person",
        value: (s.extension_review ?? 0) + (s.extension_declined ?? 0) + (s.callback_booked ?? 0) + (s.email_handoff ?? 0),
        note: "Reviews, callbacks and emails",
        icon: PhoneCall,
      },
      { label: "Medical priority callbacks", value: s.priority_callback ?? 0, note: "Powered medical equipment at home", icon: HeartPulse },
      { label: "Safety stops", value: s.safety_stop ?? 0, note: "Downed lines sent to 911 and dispatch", icon: TriangleAlert },
    ];
  }, [stats]);

  const events = (feed?.events ?? []).filter((e) => filter === "all" || TYPES[e.type]?.group === filter);
  const totalCustomers = feed?.outages.reduce((a, o) => a + o.customersAffected, 0) ?? 0;
  const lastUpdated = now ? new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Page intro */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Brightvale Electric · Storm operations</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">Dispatcher console</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Every action GridGuide takes for a customer appears here as it happens: tickets, alerts, extensions, callbacks and safety
            stops. Phone numbers are masked and all data is fictional.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${error ? "bg-red-600" : paused ? "bg-slate-400" : "animate-pulse bg-emerald-500"}`}
            />
            {error ? "Connection lost, retrying" : paused ? "Updates paused" : "Live"}
            {lastUpdated && !error && <span className="text-slate-500 dark:text-slate-400">· updated {lastUpdated}</span>}
          </p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {paused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Pause aria-hidden="true" className="h-4 w-4" />}
            {paused ? "Resume live updates" : "Pause live updates"}
          </button>
        </div>
      </div>

      {/* Screen-reader announcement of new actions */}
      <div role="status" aria-live="polite" className="sr-only">
        {paused ? "" : announcement}
      </div>

      {/* Summary */}
      <section aria-labelledby="summary-title" className="mt-8">
        <h2 id="summary-title" className="sr-only">
          Summary of actions
        </h2>
        <ul role="list" className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {tiles.map(({ label, value, note, icon: Icon }) => (
            <li key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Icon aria-hidden="true" className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm font-medium leading-tight text-slate-900 dark:text-white">{label}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{note}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Feed */}
        <section aria-labelledby="feed-title" className="rounded-xl border border-slate-200 bg-white lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h2 id="feed-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              Live action feed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Newest first. New items are highlighted for a few seconds.</p>
            <div role="group" aria-label="Filter actions by type" className="mt-3 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-11 rounded-full border px-3 text-sm font-medium transition-colors ${
                    filter === f.id
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {!feed && !error && <p className="p-8 text-center text-sm text-slate-600 dark:text-slate-400">Loading actions…</p>}
          {error && !feed && (
            <p className="p-8 text-center text-sm text-red-700 dark:text-red-300">
              Couldn&apos;t load the feed. It will retry automatically.
            </p>
          )}
          {feed && events.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <Inbox aria-hidden="true" className="h-8 w-8 text-slate-400" />
              <p className="font-medium text-slate-900 dark:text-white">
                {filter === "all" ? "No actions yet" : "No actions of this type yet"}
              </p>
              <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
                Start a conversation with GridGuide, then come back here to watch its actions appear.
              </p>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-300"
              >
                Open the live demo
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          )}
          {events.length > 0 && (
            <ol aria-label="Actions, newest first" className="max-h-[38rem] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800" tabIndex={0}>
              {events.map((e) => {
                const t = TYPES[e.type] ?? { label: e.type, icon: Search, tone: "bg-slate-100 text-slate-800", group: "system" as Group };
                const Icon = t.icon;
                return (
                  <li
                    key={e.id}
                    className={`flex flex-col gap-1 px-4 py-3 transition-colors duration-1000 sm:flex-row sm:items-start sm:gap-3 ${
                      fresh.has(e.id) ? "bg-amber-50 dark:bg-amber-400/10" : ""
                    }`}
                  >
                    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${t.tone}`}>
                      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                      {t.label}
                    </span>
                    <p className="flex-1 text-sm leading-snug text-slate-800 dark:text-slate-200">{e.summary}</p>
                    <time
                      dateTime={e.at}
                      title={new Date(e.at).toLocaleString()}
                      className="shrink-0 text-xs tabular-nums text-slate-600 dark:text-slate-400"
                    >
                      {timeAgo(e.at, now) || new Date(e.at).toLocaleTimeString()}
                    </time>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="space-y-6">
          {/* Outages */}
          <section aria-labelledby="outages-title" className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <h2 id="outages-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                Active outages
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{totalCustomers.toLocaleString("en-US")} customers without power</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Active outages by area, with customers affected and estimated restoration time</caption>
                <thead className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">Area</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {feed?.outages.map((o) => (
                    <tr key={o.outageId}>
                      <th scope="row" className="px-4 py-3 align-top font-normal">
                        <span className="block font-medium text-slate-900 dark:text-white">
                          {o.area} · {o.zip}
                        </span>
                        <span className="block text-xs text-slate-600 dark:text-slate-400">{o.cause}</span>
                        <span className="mt-1 block text-xs text-slate-700 dark:text-slate-300">Estimated restoration: {o.etr}</span>
                      </th>
                      <td className="px-4 py-3 text-right align-top tabular-nums text-slate-800 dark:text-slate-200">
                        {o.customersAffected.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Test values */}
          <section aria-labelledby="test-title" className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 id="test-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              Test values
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use these in the chat to see different outcomes.</p>
            <dl className="mt-3 space-y-3 text-sm">
              {[
                { value: "90001", label: "ZIP code", desc: "Known outage, no duplicate ticket" },
                { value: "90002", label: "ZIP code", desc: "New outage, a real ticket is filed" },
                { value: "90009", label: "ZIP code", desc: "Simulated system error" },
                { value: "0178", label: "last 4 digits", desc: "Any 4 digits work" },
              ].map((t) => (
                <div key={t.value} className="flex items-center justify-between gap-3">
                  <dt className="text-slate-700 dark:text-slate-300">{t.desc}</dt>
                  <dd>
                    <CopyButton value={t.value} label={t.label} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Rules */}
          <section aria-labelledby="rules-title" className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 id="rules-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              Rules GridGuide follows
            </h2>
            <ul role="list" className="mt-3 space-y-3 text-sm">
              {RULES.map((r) => (
                <li key={r.title}>
                  <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
                  <p className="text-slate-600 dark:text-slate-400">{r.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
