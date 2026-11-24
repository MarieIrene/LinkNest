"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// The browser fires this once per page load; keep it for whichever button asks first.
let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as InstallPromptEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * "Install app" for the PWA. Android/Chrome/Edge get the browser's install dialog;
 * iPhone/iPad get short instructions (Safari has no install dialog). Hidden once installed.
 */
export function InstallAppButton({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<"hidden" | "prompt" | "ios">("hidden");
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const update = () => {
      if (isStandalone()) setMode("hidden");
      else if (deferredPrompt) setMode("prompt");
      else if (isIos()) setMode("ios");
      else setMode("hidden");
    };
    update();
    listeners.add(update);
    return () => void listeners.delete(update);
  }, []);

  if (mode === "hidden") return null;

  async function install() {
    if (mode === "ios") return setShowIosHelp((v) => !v);
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    setMode("hidden");
  }

  return (
    <>
      <button type="button" onClick={install} className={className} aria-expanded={mode === "ios" ? showIosHelp : undefined}>
        <Icon name="download" /> Install app
      </button>
      {showIosHelp && (
        <p className="mx-3 mb-2 rounded-xl bg-secondary-soft px-3 py-2 text-sm text-primary-dark">
          In Safari, tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong>.
        </p>
      )}
    </>
  );
}
