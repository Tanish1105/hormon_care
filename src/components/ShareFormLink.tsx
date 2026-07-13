"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Check, Copy, ExternalLink } from "lucide-react";

type ShareFormLinkProps = {
  url: string;
  label?: string;
  hint?: string;
};

export function ShareFormLink({
  url,
  label = "Direct form link (no login needed)",
  hint,
}: ShareFormLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(url)}`;

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4">
      <p className="text-sm font-medium text-sky-950">{label}</p>
      {hint ? <p className="mt-1 text-xs text-sky-800/80">{hint}</p> : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input readOnly value={url} className="bg-white font-mono text-xs" />
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={copy}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
