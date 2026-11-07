"use client";

import { useId, useState } from "react";

type Field = { key: keyof Inputs; label: string; help: string; min: number; max: number; step: number; suffix?: string; prefix?: string };
type Inputs = { customers: number; contactRate: number; resolvedRate: number; minutes: number; costPerCall: number };

const FIELDS: Field[] = [
  { key: "customers", label: "Customers without power", help: "Size of the storm", min: 1000, max: 500000, step: 1000 },
  { key: "contactRate", label: "Share who contact the utility", help: "Report, ask for an estimate, or ask about bills", min: 5, max: 100, step: 5, suffix: "%" },
  { key: "resolvedRate", label: "Share GridGuide completes without a person", help: "Known outages, tickets, alerts, extensions", min: 0, max: 100, step: 5, suffix: "%" },
  { key: "minutes", label: "Average phone handle time", help: "Minutes per agent-handled call", min: 1, max: 30, step: 1, suffix: " min" },
  { key: "costPerCall", label: "Cost per agent-handled call", help: "Fully loaded, in dollars", min: 1, max: 30, step: 0.5, prefix: "$" },
];

/** Transparent, adjustable estimate of what GridGuide saves during one storm. All defaults are assumptions. */
export function ImpactEstimator() {
  const id = useId();
  const [v, setV] = useState<Inputs>({ customers: 40000, contactRate: 30, resolvedRate: 60, minutes: 6, costPerCall: 6 });

  const contacts = Math.round(v.customers * (v.contactRate / 100));
  const handled = Math.round(contacts * (v.resolvedRate / 100));
  const hours = Math.round((handled * v.minutes) / 60);
  const dollars = Math.round(handled * v.costPerCall);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-describedby={`${id}-note`}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`${id}-${f.key}`} className="font-medium text-slate-900 dark:text-white">
                {f.label}
              </label>
              <output htmlFor={`${id}-${f.key}`} className="tabular-nums text-slate-900 dark:text-white">
                {f.prefix}
                {fmt(v[f.key])}
                {f.suffix}
              </output>
            </div>
            <p id={`${id}-${f.key}-help`} className="text-sm text-slate-600 dark:text-slate-400">
              {f.help}
            </p>
            <input
              id={`${id}-${f.key}`}
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={v[f.key]}
              aria-describedby={`${id}-${f.key}-help`}
              aria-valuetext={`${f.prefix ?? ""}${fmt(v[f.key])}${f.suffix ?? ""}`}
              onChange={(e) => setV((cur) => ({ ...cur, [f.key]: Number(e.target.value) }))}
              className="mt-2 h-11 w-full cursor-pointer accent-amber-500"
            />
          </div>
        ))}
      </form>

      <div className="flex flex-col justify-between gap-6">
        <dl aria-live="polite" className="grid grid-cols-2 gap-3">
          {[
            { label: "Customers who reach out", value: fmt(contacts) },
            { label: "Calls kept off the hold line", value: fmt(handled) },
            { label: "Agent hours freed", value: fmt(hours) },
            { label: "Contact center cost avoided", value: `$${fmt(dollars)}` },
          ].map((o) => (
            <div key={o.label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <dt className="text-sm text-slate-600 dark:text-slate-300">{o.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{o.value}</dd>
            </div>
          ))}
        </dl>
        <p id={`${id}-note`} className="text-sm text-slate-600 dark:text-slate-400">
          Illustrative estimate for a single storm. Every default above is an assumption, not utility data. Move the sliders to match
          your own numbers. The freed agent time goes to the calls that need a person, such as Medical Priority customers and
          payment plans.
        </p>
      </div>
    </div>
  );
}
