"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Zap } from "lucide-react";
import { DEMO_URL } from "@/lib/site";
import { InstallButton } from "./pwa";

const LINKS = [
  { href: "/", label: "Overview", short: "Overview" },
  { href: "/dashboard", label: "Dispatcher console", short: "Console" },
  { href: "/brightvale", label: "Brightvale site", short: "Brightvale" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-2 pb-1 sm:px-6 sm:py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-md font-semibold text-slate-900 dark:text-white">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
            <Zap className="h-5 w-5" />
          </span>
          <span>GridGuide</span>
          <span className="sr-only">home</span>
        </Link>

        <nav aria-label="Main" className="order-last -mx-1 w-full sm:order-none sm:mx-0 sm:w-auto">
          <ul className="flex gap-1 overflow-x-auto px-1 pb-1 text-sm [scrollbar-width:none] sm:overflow-visible sm:pb-0">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="sm:hidden">{l.short}</span>
                    <span className="hidden sm:inline">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <InstallButton compact />
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
          >
            <span className="sm:hidden">Live demo</span>
            <span className="hidden sm:inline">Try the live demo</span>
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      Brightvale Electric is a fictional utility built for the eGain AI Agent Hackathon. All names, phone numbers and data are fictional.
    </footer>
  );
}
