"use client";

import { RefreshCw } from "lucide-react";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 font-semibold text-slate-950 hover:bg-amber-300"
    >
      <RefreshCw aria-hidden="true" className="h-5 w-5" />
      Try again
    </button>
  );
}
