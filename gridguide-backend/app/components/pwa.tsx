"use client";

import { useEffect, useState } from "react";
import { Download, Share, WifiOff, X } from "lucide-react";
import { CONTACT } from "@/lib/site";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** Registers the service worker and shows a spoken banner when the device goes offline. */
export function PwaRuntime() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
    }
    const update = () => setOffline(!navigator.onLine);
    const first = setTimeout(update, 0);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      clearTimeout(first);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {offline && (
        <p className="pointer-events-auto flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg">
          <WifiOff aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-300" />
          <span>You&apos;re offline. Saved pages still work. In an emergency call</span>
          <a href="tel:911" className="font-semibold underline underline-offset-2">911</a>
          <span>or</span>
          <a href={`tel:${CONTACT.emergency.tel}`} className="font-semibold underline underline-offset-2">
            {CONTACT.emergency.label}
          </a>
        </p>
      )}
    </div>
  );
}

/** "Install app" button: native prompt on Chrome/Edge/Android, step-by-step help on iPhone and iPad. */
export function InstallButton({ tone = "light", compact = false }: { tone?: "light" | "dark"; compact?: boolean }) {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    const first = setTimeout(() => {
      setInstalled(standalone);
      setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    }, 0);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(first);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!deferred && !ios)) return null;

  const cls =
    tone === "dark"
      ? "border-white/40 text-white hover:bg-white/10"
      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800";
  const size = compact ? "min-w-11 justify-center px-3 sm:px-4" : "px-4";
  const label = <span className={compact ? "sr-only sm:not-sr-only" : ""}>Install app</span>;

  if (deferred) {
    return (
      <button
        type="button"
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice.catch(() => undefined);
          setDeferred(null);
        }}
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${size} ${cls}`}
      >
        <Download aria-hidden="true" className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={helpOpen}
        aria-controls="ios-install-help"
        onClick={() => setHelpOpen((o) => !o)}
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${size} ${cls}`}
      >
        <Download aria-hidden="true" className="h-4 w-4" />
        {label}
      </button>
      {helpOpen && (
        <div
          id="ios-install-help"
          role="region"
          aria-label="How to install on iPhone or iPad"
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">Add to your Home Screen</p>
            <button type="button" onClick={() => setHelpOpen(false)} aria-label="Close install help" className="-m-2 rounded-md p-2">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Tap the <Share aria-label="Share" className="inline h-4 w-4 align-[-3px]" /> Share button in Safari.
            </li>
            <li>Choose “Add to Home Screen”.</li>
            <li>Tap “Add”.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
