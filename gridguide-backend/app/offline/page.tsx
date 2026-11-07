import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, Phone, TriangleAlert, WifiOff } from "lucide-react";
import { CONTACT } from "@/lib/site";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "You're offline",
  description: "Emergency numbers and safety steps from Brightvale Electric, available without a connection.",
};

export default function Offline() {
  return (
    <main id="main" className="flex-1 bg-[#0b1f3a] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-xl">
        <WifiOff aria-hidden="true" className="h-10 w-10 text-amber-300" />
        <h1 className="mt-4 text-3xl font-semibold">You&apos;re offline</h1>
        <p className="mt-3 text-slate-200">
          Storms can knock out mobile data. This page is saved on your device, so the most important information is always here.
          Phone calls still work even when data doesn&apos;t.
        </p>

        <section aria-labelledby="emergency-title" className="mt-8 rounded-2xl bg-white p-6 text-slate-900">
          <h2 id="emergency-title" className="flex items-center gap-2 text-xl font-semibold text-red-800">
            <TriangleAlert aria-hidden="true" className="h-6 w-6" />
            Downed line, sparks or fire?
          </h2>
          <p className="mt-2 text-slate-700">Stay at least 35 feet away, keep others away, and call right now.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href="tel:911" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-700 px-5 font-semibold text-white hover:bg-red-800">
              <Phone aria-hidden="true" className="h-5 w-5" />
              Call 911
            </a>
            <a
              href={`tel:${CONTACT.emergency.tel}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-red-700 px-5 font-semibold text-red-800 hover:bg-red-50"
            >
              <Phone aria-hidden="true" className="h-5 w-5" />
              {CONTACT.emergency.label}
            </a>
          </div>
        </section>

        <section aria-labelledby="other-title" className="mt-6 space-y-3">
          <h2 id="other-title" className="text-lg font-semibold">
            Other numbers
          </h2>
          <a
            href={`tel:${CONTACT.medical.tel}`}
            className="flex min-h-12 items-center gap-3 rounded-lg bg-white/10 px-4 font-medium ring-1 ring-white/20 hover:bg-white/15"
          >
            <HeartPulse aria-hidden="true" className="h-5 w-5 text-rose-300" />
            Medical Priority line {CONTACT.medical.label}
          </a>
          <a
            href={`tel:${CONTACT.service.tel}`}
            className="flex min-h-12 items-center gap-3 rounded-lg bg-white/10 px-4 font-medium ring-1 ring-white/20 hover:bg-white/15"
          >
            <Phone aria-hidden="true" className="h-5 w-5 text-amber-300" />
            Customer Service {CONTACT.service.label}
          </a>
        </section>

        <section aria-labelledby="tips-title" className="mt-8">
          <h2 id="tips-title" className="text-lg font-semibold">
            While the power is out
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
            <li>Never run a generator indoors or in a garage. Keep it at least 20 feet from your home.</li>
            <li>Keep the fridge and freezer closed. A closed fridge keeps food safe for about 4 hours.</li>
            <li>Unplug electronics to protect them from a surge when power returns.</li>
            <li>If anyone relies on medical equipment and is in danger, call 911.</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <RetryButton />
          <Link href="/brightvale" className="inline-flex min-h-12 items-center rounded-lg px-4 font-semibold text-amber-200 underline underline-offset-4">
            Go to the Brightvale homepage
          </Link>
        </div>
        <p className="mt-8 text-xs text-slate-300">Brightvale Electric is a fictional utility. All numbers are fictional.</p>
      </div>
    </main>
  );
}
