"use client";

import { useState } from "react";

/** Shows the address that gets written onto the person's NFC card or tag. */
export function CardPanel({ cardUrl }: { cardUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your card link:", cardUrl);
    }
  }

  return (
    <div className="panel space-y-4">
      <p className="leading-relaxed text-ink/75">
        Your smart card and social media tag hold this link. When someone taps the card on an NFC-enabled phone,
        a notification pops up and opens your profile, with your photo, details and links. It keeps working even if
        you change your username.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-primary">
          {cardUrl}
        </code>
        <button type="button" onClick={copy} className="btn-primary shrink-0" aria-live="polite">
          {copied ? "Copied" : "Copy card link"}
        </button>
      </div>
      <p className="text-sm text-ink/55">
        Don&apos;t have a card yet? <a href="/#book" className="font-medium text-primary underline-offset-2 hover:underline">Book one</a>.
      </p>
    </div>
  );
}
