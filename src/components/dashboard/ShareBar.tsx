"use client";

import { useState } from "react";

export function ShareBar({ url, views, clicks, taps }: { url: string; views: number; clicks: number; taps: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your link:", url);
    }
  }

  return (
    <div className="on-dark rounded-2xl bg-primary p-5 text-white sm:p-6">
      <p className="text-sm text-white/70">Your page is live at</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate font-display text-xl font-bold text-secondary underline-offset-4 hover:underline sm:text-2xl">
          {url.replace(/^https?:\/\//, "")}
        </a>
        <button type="button" onClick={copy} className="btn-press shrink-0" aria-live="polite">
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <p className="mt-4 text-sm text-white/75">
        {views.toLocaleString()} page {views === 1 ? "view" : "views"}, {taps.toLocaleString()} card{" "}
        {taps === 1 ? "tap" : "taps"}, {clicks.toLocaleString()} link {clicks === 1 ? "click" : "clicks"}
      </p>
    </div>
  );
}
