"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Accessible copy-to-clipboard button with a spoken confirmation. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${label}: ${value}`}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 font-mono text-sm text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {value}
      {copied ? <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" /> : <Copy aria-hidden="true" className="h-4 w-4 text-slate-500" />}
      <span role="status" className="sr-only">
        {copied ? `${value} copied` : ""}
      </span>
    </button>
  );
}
