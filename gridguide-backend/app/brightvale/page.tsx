import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  BellRing,
  CalendarCheck,
  ChevronDown,
  Clock,
  ExternalLink,
  HeartPulse,
  Mail,
  MessageCircle,
  Phone,
  Siren,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { CONTACT, DEMO_URL } from "@/lib/site";
import { InstallButton } from "../components/pwa";
import { SEED_OUTAGES, describeOutage } from "@/lib/gridguide";

export const metadata: Metadata = {
  title: "Brightvale Electric",
  description: "Fictional electric utility homepage used to demo the GridGuide AI agent (eGain AI Agent Hackathon).",
};

const NAV = [
  { href: "#outages", label: "Outages" },
  { href: "#safety", label: "Safety" },
  { href: "#billing", label: "Billing" },
  { href: "#medical", label: "Medical Priority" },
  { href: "#contact", label: "Contact" },
];

const HELP = [
  { href: "#outages", icon: Zap, title: "Report or check an outage", body: "See if we already know about your outage and get an estimated restoration time." },
  { href: "#outages", icon: BellRing, title: "Get restoration alerts", body: "We text you when the estimate changes and when your power is back." },
  { href: "#billing", icon: CalendarCheck, title: "More time to pay", body: "Extensions of up to 14 days are approved right away, once every 12 months." },
  { href: "#medical", icon: HeartPulse, title: "Medical Priority", body: "Priority callbacks for homes that rely on powered medical equipment." },
];

const FAQ = [
  {
    q: "My power is out. Do I need to report it?",
    a: "Check if we already know about it first. Ask GridGuide or look at the outage list above. If your area isn't listed, report it in chat with your ZIP code and the last 4 digits of the phone number on your account.",
  },
  {
    q: "Why does my estimated restoration time keep changing?",
    a: "An estimate is based on the damage found so far. It can change when crews assess the site, find more damage, or have to stop for unsafe weather. Text alerts tell you when it changes.",
  },
  {
    q: "Is it safe to run a generator in my garage?",
    a: "No. Never run a generator indoors or in a garage, even with the door open. Run it outside, at least 20 feet from your home, with the exhaust pointing away from windows and doors.",
  },
  {
    q: "Will I be charged a late fee because of the storm?",
    a: "During a declared storm emergency, late fees are waived for bills due during the emergency and for 14 days afterwards.",
  },
  {
    q: "Will GridGuide ever ask for my account number or password?",
    a: "No. GridGuide only asks for your ZIP code and the last 4 digits of your phone number. Never share full account numbers, passwords or card details in chat.",
  },
];

function ChatButton({ variant = "primary", compact = false }: { variant?: "primary" | "dark"; compact?: boolean }) {
  const cls =
    variant === "primary"
      ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
      : "bg-[#0b1f3a] text-white hover:bg-[#13315c]";
  return (
    <a
      href={DEMO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-colors ${compact ? "min-h-11 px-4 text-sm" : "min-h-12 px-5"} ${cls}`}
    >
      <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className="whitespace-nowrap">Chat with GridGuide</span>
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">(opens the live AI assistant in a new tab)</span>
    </a>
  );
}

async function liveOutages() {
  await connection(); // estimated restoration times are computed per request
  return Object.values(SEED_OUTAGES).map(describeOutage);
}

async function HeroOutages() {
  const outages = await liveOutages();
  const total = outages.reduce((a, o) => a + o.customersAffected, 0);
  return (
    <>
      <p className="text-sm text-slate-300">{total.toLocaleString("en-US")} customers affected</p>
      <ul role="list" className="mt-4 space-y-3 text-sm">
        {outages.map((o) => (
          <li key={o.outageId} className="flex justify-between gap-3">
            <span>
              {o.area} · {o.zip}
            </span>
            <span className="tabular-nums text-slate-300">{o.customersAffected.toLocaleString("en-US")}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

async function OutageRows() {
  const outages = await liveOutages();
  return (
    <>
      {outages.map((o) => (
        <tr key={o.outageId}>
          <th scope="row" className="px-4 py-3 font-medium">
            {o.area} · {o.zip}
          </th>
          <td className="px-4 py-3 text-slate-700">{o.cause}</td>
          <td className="px-4 py-3 text-slate-700">{o.crewStatus}</td>
          <td className="px-4 py-3 text-slate-700">{o.etr}</td>
          <td className="px-4 py-3 text-right tabular-nums">{o.customersAffected.toLocaleString("en-US")}</td>
        </tr>
      ))}
    </>
  );
}

async function OutageCards() {
  const outages = await liveOutages();
  return (
    <ul role="list" className="space-y-3">
      {outages.map((o) => (
        <li key={o.outageId} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-semibold">
              {o.area} · {o.zip}
            </h3>
            <p className="text-sm tabular-nums text-slate-700">{o.customersAffected.toLocaleString("en-US")} customers</p>
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-slate-600">Cause</dt>
            <dd>{o.cause}</dd>
            <dt className="text-slate-600">Crew</dt>
            <dd>{o.crewStatus}</dd>
            <dt className="text-slate-600">Estimate</dt>
            <dd>{o.etr}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export default function Brightvale() {

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Emergency banner */}
      <div role="region" aria-label="Storm emergency notice" className="bg-red-700 px-4 py-0.5 text-center text-sm text-white">
        <Siren aria-hidden="true" className="mr-1.5 inline h-4 w-4 align-[-2px]" />
        <strong>Storm alert:</strong> see a downed line or sparks? Stay 35 feet away and call{" "}
        <a href="tel:911" className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold underline underline-offset-2">
          911
        </a>{" "}
        and{" "}
        <a href={`tel:${CONTACT.emergency.tel}`} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2">
          {CONTACT.emergency.label}
        </a>
        .
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-2 pb-1 sm:px-6 md:py-4">
          <a href="#main" className="flex min-h-11 items-center gap-2 rounded-md">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <Zap className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold">Brightvale Electric</span>
          </a>
          <div className="md:order-last">
            <InstallButton compact />
          </div>
          <nav aria-label="Brightvale Electric" className="order-last -mx-1 w-full md:order-none md:mx-0 md:w-auto">
            <ul className="flex gap-1 overflow-x-auto px-1 pb-1 text-sm [scrollbar-width:none] md:overflow-visible md:pb-0">
              {NAV.map((n) => (
                <li key={n.href} className="shrink-0">
                  <a
                    href={n.href}
                    className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section aria-labelledby="hero-title" className="bg-[#0b1f3a] text-white">
          <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Storm response · Live</p>
              <h1 id="hero-title" className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
                Power out? Skip the hold line.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-200">
                GridGuide, our AI assistant, can check your outage, report it, set up restoration alerts, give you more time to pay,
                or connect you with a person, 24 hours a day.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ChatButton />
                <a
                  href="#outages"
                  className="inline-flex min-h-12 items-center rounded-lg border border-white/40 px-5 font-semibold text-white hover:bg-white/10"
                >
                  View current outages
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-300">In the demo, open the chat with the bubble in the bottom-right corner.</p>
            </div>

            <section aria-labelledby="hero-outages" className="rounded-xl bg-white/5 p-5 ring-1 ring-white/15 md:col-span-2">
              <h2 id="hero-outages" className="font-semibold">
                Current storm outages
              </h2>
              <Suspense fallback={<p className="mt-2 text-sm text-slate-300">Loading current outages…</p>}>
                <HeroOutages />
              </Suspense>
              <p className="mt-4 text-xs text-slate-300">Restoration times are estimates and may change.</p>
            </section>
          </div>
        </section>

        {/* How can we help */}
        <section aria-labelledby="help-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="help-title" className="text-2xl font-semibold">
            How can we help?
          </h2>
          <ul role="list" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HELP.map(({ href, icon: Icon, title, body }) => (
              <li key={title}>
                <a
                  href={href}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 p-5 transition-colors hover:border-amber-400 hover:bg-amber-50"
                >
                  <Icon aria-hidden="true" className="h-6 w-6 text-amber-600" />
                  <span className="mt-3 font-semibold group-hover:underline">{title}</span>
                  <span className="mt-1 text-sm text-slate-600">{body}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Outages */}
        <section id="outages" aria-labelledby="outages-title" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 id="outages-title" className="text-2xl font-semibold">
              Outages and restoration
            </h2>
            <p className="mt-2 max-w-2xl text-slate-700">
              If your area is listed, we already know about it and crews are working on it. You don&apos;t need to report it again. Ask
              GridGuide to text you when the estimate changes.
            </p>
            <div className="mt-6 sm:hidden">
              <Suspense fallback={<p className="text-sm text-slate-600">Loading current outages…</p>}>
                <OutageCards />
              </Suspense>
            </div>
            <div className="mt-6 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Current outages with cause, crew status and estimated restoration time</caption>
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-700">
                  <tr>
                    <th scope="col" className="px-4 py-3">Area</th>
                    <th scope="col" className="px-4 py-3">Cause</th>
                    <th scope="col" className="px-4 py-3">Crew status</th>
                    <th scope="col" className="px-4 py-3">Estimated restoration</th>
                    <th scope="col" className="px-4 py-3 text-right">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <Suspense
                    fallback={
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-slate-600">
                          Loading current outages…
                        </td>
                      </tr>
                    }
                  >
                    <OutageRows />
                  </Suspense>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ChatButton variant="dark" />
              <p className="flex items-center gap-1.5 text-sm text-slate-700">
                <Clock aria-hidden="true" className="h-4 w-4" />
                Not listed? Report it in chat. It takes about a minute.
              </p>
            </div>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" aria-labelledby="safety-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-2xl border-2 border-red-700 p-6 sm:p-8">
            <h2 id="safety-title" className="flex items-center gap-2 text-2xl font-semibold text-red-800">
              <TriangleAlert aria-hidden="true" className="h-7 w-7" />
              Downed power lines are emergencies
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-800">
              <li>Assume every downed line is live. Stay at least 35 feet away, about the length of a school bus.</li>
              <li>Keep children and pets away. Never touch the line or anything touching it.</li>
              <li>If a line falls on your car, stay inside and call 911 unless the car is on fire.</li>
              <li>Report it by phone, not chat, so we can send a crew right away.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:911" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-red-700 px-5 font-semibold text-white hover:bg-red-800">
                <Phone aria-hidden="true" className="h-5 w-5" />
                Call 911
              </a>
              <a
                href={`tel:${CONTACT.emergency.tel}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-red-700 px-5 font-semibold text-red-800 hover:bg-red-50"
              >
                <Phone aria-hidden="true" className="h-5 w-5" />
                Emergency Line {CONTACT.emergency.label}
              </a>
            </div>
          </div>
        </section>

        {/* Billing + Medical */}
        <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-14 sm:px-6 md:grid-cols-2">
          <section id="billing" aria-labelledby="billing-title" className="rounded-xl border border-slate-200 p-6">
            <h2 id="billing-title" className="flex items-center gap-2 text-xl font-semibold">
              <CalendarCheck aria-hidden="true" className="h-6 w-6 text-amber-600" />
              Need more time to pay?
            </h2>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li>Up to 14 extra days: approved right away, once every 12 months, with no fee.</li>
              <li>15 to 30 days, or a second extension: reviewed by Customer Care within 2 business days.</li>
              <li>Larger balances: a payment plan over 3 to 12 months.</li>
              <li>During declared storm emergencies, late fees are waived.</li>
            </ul>
            <div className="mt-5">
              <ChatButton variant="dark" />
            </div>
          </section>

          <section id="medical" aria-labelledby="medical-title" className="rounded-xl border border-slate-200 p-6">
            <h2 id="medical-title" className="flex items-center gap-2 text-xl font-semibold">
              <HeartPulse aria-hidden="true" className="h-6 w-6 text-rose-600" />
              Medical Priority program
            </h2>
            <p className="mt-3 text-slate-700">
              For households that rely on oxygen, dialysis, a ventilator, a CPAP machine or refrigerated medicine. You get priority
              callbacks during outages, at least 48 hours&apos; notice of planned work, and check-in calls.
            </p>
            <p className="mt-3 text-slate-700">
              Medical Priority doesn&apos;t restore your power first, so keep a backup plan. If anyone is in danger, call 911.
            </p>
            <a
              href={`tel:${CONTACT.medical.tel}`}
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-5 font-semibold hover:bg-slate-50"
            >
              <Phone aria-hidden="true" className="h-5 w-5" />
              Medical Priority line {CONTACT.medical.label}
            </a>
          </section>
        </div>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
            <h2 id="faq-title" className="text-2xl font-semibold">
              Common questions
            </h2>
            <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {FAQ.map((f) => (
                <details key={f.q} className="group p-0">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-slate-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="contact-title" className="text-2xl font-semibold">
            Contact us
          </h2>
          <ul role="list" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-xl border border-slate-200 p-5">
              <p className="font-semibold">Emergencies, 24/7</p>
              <p className="mt-1 text-sm text-slate-600">Downed lines, sparks or fire</p>
              <a href={`tel:${CONTACT.emergency.tel}`} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-red-800 underline underline-offset-2">
                <Phone aria-hidden="true" className="h-4 w-4" />
                {CONTACT.emergency.label}
              </a>
            </li>
            <li className="rounded-xl border border-slate-200 p-5">
              <p className="font-semibold">Customer Service</p>
              <p className="mt-1 text-sm text-slate-600">7 AM to 8 PM, Monday to Saturday</p>
              <a href={`tel:${CONTACT.service.tel}`} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-2">
                <Phone aria-hidden="true" className="h-4 w-4" />
                {CONTACT.service.label}
              </a>
            </li>
            <li className="rounded-xl border border-slate-200 p-5">
              <p className="font-semibold">Email</p>
              <p className="mt-1 text-sm text-slate-600">Replies within 1 business day</p>
              <a href={`mailto:${CONTACT.email}`} className="mt-3 inline-flex min-h-11 items-center gap-2 break-all font-semibold underline underline-offset-2">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                {CONTACT.email}
              </a>
            </li>
            <li className="rounded-xl border border-amber-300 bg-amber-50 p-5">
              <p className="font-semibold">GridGuide chat, 24/7</p>
              <p className="mt-1 text-sm text-slate-600">Outages, alerts, billing, or a person</p>
              <div className="mt-3">
                <ChatButton compact />
              </div>
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        <p>Brightvale Electric is a fictional utility created for the eGain AI Agent Hackathon. All names, numbers and data are fictional.</p>
        <p className="mt-2">
          <Link href="/" className="font-medium text-slate-800 underline underline-offset-2">
            About the GridGuide project
          </Link>
          {" · "}
          <Link href="/dashboard" className="font-medium text-slate-800 underline underline-offset-2">
            Dispatcher console
          </Link>
        </p>
      </footer>
    </div>
  );
}
