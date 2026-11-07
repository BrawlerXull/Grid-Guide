import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  ShieldAlert,
  UserRound,
  Workflow,
  Zap,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "./components/site-header";
import { CopyButton } from "./components/copy-button";
import { DEMO_URL, RULES, SCENARIOS } from "@/lib/site";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Answers from trusted content",
    body: "Ten Brightvale help articles power grounded answers about outages, safety, bills and claims, with the source cited.",
  },
  {
    icon: Zap,
    title: "Takes real actions",
    body: "Checks live outage status, files tickets, signs people up for restoration texts, approves extensions and books callbacks.",
  },
  {
    icon: ShieldAlert,
    title: "Knows when not to act",
    body: "Downed lines get a safety stop and a dispatch alert. Medical-equipment households get priority. Out-of-policy requests go to a person.",
  },
  {
    icon: UserRound,
    title: "Hands off with context",
    body: "Customers can book a callback, email Customer Care or call. The specialist already has the conversation.",
  },
];

const FLOW = [
  { title: "Customer", body: "Opens chat on the Brightvale site during a storm." },
  { title: "Pre-chat workflow", body: "Collects topic, ZIP code and a medical-equipment flag. Safety emergencies stop here." },
  { title: "eGain AI Agent", body: "Answers from knowledge, matches intents, runs process workflows and Custom Actions." },
  { title: "GridGuide backend", body: "Next.js API on Vercel with Upstash Redis. Applies Brightvale policy and records every action." },
  { title: "Dispatcher console", body: "Shows each action live, so staff can see what the agent did." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section aria-labelledby="hero-title" className="bg-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">eGain AI Agent Hackathon · Utilities</p>
            <h1 id="hero-title" className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              GridGuide helps storm-hit customers without the hold line.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              An AI support agent for Brightvale Electric, a fictional power company. It answers questions, takes real actions,
              and knows when a human or 911 must take over.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 font-semibold text-slate-950 transition-colors hover:bg-amber-300"
              >
                Chat with GridGuide
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">(opens the live eGain demo in a new tab)</span>
              </a>
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/30 px-5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                Open the dispatcher console
              </Link>
              <Link
                href="#try-it"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg px-5 font-semibold text-amber-200 underline-offset-4 hover:underline"
              >
                See what to try
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Tip: open the chat and the dispatcher console side by side to watch each action appear as it happens.
            </p>
          </div>
        </section>

        {/* What it does */}
        <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="features-title" className="text-2xl font-semibold text-slate-900 dark:text-white">
            What GridGuide does
          </h2>
          <ul role="list" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Try it */}
        <section id="try-it" aria-labelledby="try-title" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 id="try-title" className="text-2xl font-semibold text-slate-900 dark:text-white">
              Try these scenarios
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Open the live demo, click the chat bubble in the bottom-right corner, and follow any scenario. All data is fictional, so
              use the example ZIP codes and numbers below.
            </p>
            <ol className="mt-8 grid gap-4 md:grid-cols-2">
              {SCENARIOS.map((s, i) => (
                <li key={s.id} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      <span className="mr-2 text-slate-500 dark:text-slate-400">{i + 1}.</span>
                      {s.title}
                    </h3>
                    {s.copy && <CopyButton value={s.copy} label={`value for ${s.title}`} />}
                  </div>
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-medium">Do: </span>
                    {s.steps}
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-medium">Expect: </span>
                    {s.expect}
                  </p>
                  <p className="mt-auto pt-3 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">{s.shows}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-slate-900 px-5 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Open the live demo
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-2">
            <Workflow aria-hidden="true" className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            <h2 id="how-title" className="text-2xl font-semibold text-slate-900 dark:text-white">
              How it works
            </h2>
          </div>
          <ol className="mt-6 grid gap-3 lg:grid-cols-5">
            {FLOW.map((f, i) => (
              <li key={f.title} className="relative rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Step {i + 1}</p>
                <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.body}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-12 text-xl font-semibold text-slate-900 dark:text-white">GridGuide&apos;s rules of judgment</h3>
          <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RULES.map((r) => (
              <li key={r.title} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.body}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 text-xl font-semibold text-slate-900 dark:text-white">Built with</h3>
          <ul role="list" className="mt-4 flex flex-wrap gap-2 text-sm">
            {[
              "eGain AI Agent for Customer",
              "Pre-chat, process and escalation workflows",
              "Custom intents",
              "4 Custom API actions",
              "Next.js on Vercel",
              "Upstash Redis",
            ].map((t) => (
              <li key={t} className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
