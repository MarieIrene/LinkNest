"use client";

import { useEffect, useId, useState } from "react";
import { NFC_URI_PREFIXES, splitUri } from "@/lib/nfc";

// Web NFC isn't in TypeScript's built-in types yet.
type NdefRecord = { recordType: string; data?: unknown; encoding?: string };
type NdefReader = {
  write: (message: { records: NdefRecord[] }, options?: { overwrite?: boolean; signal?: AbortSignal }) => Promise<void>;
  makeReadOnly: (options?: { signal?: AbortSignal }) => Promise<void>;
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  onreading: ((event: { message: { records: NdefRecord[] } }) => void) | null;
  onreadingerror: (() => void) | null;
};
declare global {
  interface Window { NDEFReader?: new () => NdefReader }
}

type Status = { kind: "idle" | "waiting" | "ok" | "error"; text: string };

function explain(err: unknown) {
  const name = (err as { name?: string })?.name;
  if (name === "NotAllowedError") return "Permission was refused. Allow NFC for this site in Chrome, and make sure NFC is turned on in your phone settings.";
  if (name === "NotSupportedError") return "This phone can't write NFC cards from the browser. Use the NFC Tools steps below.";
  if (name === "NotReadableError") return "The card couldn't be read. Hold it flat against the back of the phone and try again.";
  if (name === "NetworkError") return "The card moved away too soon. Hold it still against the phone until you see the confirmation.";
  if (name === "AbortError") return "Stopped.";
  return "Writing failed. Hold the card flat against the back of the phone (near the camera) and try again.";
}

/**
 * Writes a link onto an NFC card from the browser (Chrome on Android), laid out like the
 * "Add a record → URL/URI" screen of NFC writing apps. Other phones get NFC Tools steps.
 */
export function NfcWriter({ url, cardLabel }: { url: string; cardLabel?: string }) {
  const initial = splitUri(url);
  const [prefix, setPrefix] = useState(initial.prefix);
  const [rest, setRest] = useState(initial.rest);
  const [lock, setLock] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const [controller, setController] = useState<AbortController | null>(null);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const full = `${prefix}${rest.trim()}`;
  const changed = full !== url;

  useEffect(() => setSupported(typeof window !== "undefined" && "NDEFReader" in window), []);

  function cancel() {
    controller?.abort();
    setController(null);
    setStatus({ kind: "idle", text: "" });
  }

  async function write() {
    if (!window.NDEFReader || !rest.trim()) return;
    if (lock && !window.confirm(
      `Lock this card after writing?\n\nA locked card can NEVER be changed again, by anyone. Only lock it if you're sure the link is final:\n${full}`,
    )) return;
    const ac = new AbortController();
    setController(ac);
    setStatus({ kind: "waiting", text: "Hold the card against the back of your phone and keep it still…" });
    try {
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: full }] }, { overwrite: true, signal: ac.signal });
      if (lock) {
        setStatus({ kind: "waiting", text: "Written. Keep holding the card while it gets locked…" });
        await ndef.makeReadOnly({ signal: ac.signal });
      }
      setStatus({ kind: "ok", text: lock ? `Done. The card now opens ${full} and is locked.` : `Done. The card now opens ${full}` });
    } catch (err) {
      setStatus({ kind: "error", text: explain(err) });
    } finally {
      setController(null);
    }
  }

  async function check() {
    if (!window.NDEFReader) return;
    const ac = new AbortController();
    setController(ac);
    setStatus({ kind: "waiting", text: "Hold the card against your phone to read it…" });
    try {
      const ndef = new window.NDEFReader();
      ndef.onreading = (event) => {
        const rec = event.message.records.find((r) => r.recordType === "url" || r.recordType === "absolute-url");
        const found = rec?.data instanceof DataView ? new TextDecoder().decode(rec.data) : "";
        ac.abort();
        setController(null);
        if (!found) setStatus({ kind: "error", text: "This card has no link on it yet." });
        else if (found === full) setStatus({ kind: "ok", text: `Correct. This card opens ${found}` });
        else setStatus({ kind: "error", text: `This card opens a different link: ${found}` });
      };
      ndef.onreadingerror = () => setStatus({ kind: "error", text: "The card couldn't be read. Try again." });
      await ndef.scan({ signal: ac.signal });
    } catch (err) {
      setController(null);
      setStatus({ kind: "error", text: explain(err) });
    }
  }

  async function copyRest() {
    try {
      await navigator.clipboard.writeText(rest.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this:", rest.trim());
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-paper p-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-ink/50">Add a record</p>
        <div className="mt-3 grid gap-3">
          <div>
            <label htmlFor={`${id}-type`} className="label">Record type</label>
            <select id={`${id}-type`} className="field" defaultValue="url" disabled>
              <option value="url">URL / URI</option>
            </select>
          </div>
          <div>
            <p className="label" id={`${id}-url-label`}>Enter your URL</p>
            <div className="flex gap-2">
              <label htmlFor={`${id}-prefix`} className="sr-only">Format</label>
              <select id={`${id}-prefix`} value={prefix} onChange={(e) => setPrefix(e.target.value)} className="field w-36 shrink-0 px-2 font-mono text-sm">
                {NFC_URI_PREFIXES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <label htmlFor={`${id}-rest`} className="sr-only">Address</label>
              <input id={`${id}-rest`} value={rest} onChange={(e) => setRest(e.target.value)} spellCheck={false} autoCapitalize="none"
                aria-describedby={`${id}-url-label`} className="field min-w-0 font-mono text-sm" />
            </div>
            <p className="mt-1.5 break-all text-sm text-ink/60">
              The card will open: <span className="font-medium text-ink">{full}</span>
            </p>
            {changed && (
              <p className="mt-1.5 text-sm text-amber-800">
                This isn&apos;t the card&apos;s LinkNest address. Taps won&apos;t be counted and the profile won&apos;t open.{" "}
                <button type="button" className="font-semibold underline" onClick={() => { setPrefix(initial.prefix); setRest(initial.rest); }}>Use the right one</button>
              </p>
            )}
            {prefix !== "https://" && !changed && <p className="mt-1.5 text-sm text-ink/55">Tip: use https:// for LinkNest cards.</p>}
          </div>
        </div>
      </div>

      {supported ? (
        <>
          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-700" />
            <span><strong>Lock the card after writing.</strong> Permanent: nobody can change the card again. Leave this off unless the address is final.</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {controller ? (
              <button type="button" onClick={cancel} className="btn-ghost border border-line">Cancel</button>
            ) : (
              <>
                <button type="button" onClick={write} disabled={!rest.trim()} className="btn-press">
                  Write to {cardLabel ?? "card"}
                </button>
                <button type="button" onClick={check} className="btn-ghost border border-line bg-white">Check card</button>
              </>
            )}
          </div>
        </>
      ) : supported === false ? (
        <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-ink/80">
          <p className="font-semibold text-ink">This phone or browser can&apos;t write cards directly.</p>
          <p className="mt-1">Writing from LinkNest works in <strong>Chrome on Android</strong>. On iPhone or a computer, use the free <strong>NFC Tools</strong> app:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Open NFC Tools and tap <strong>Write</strong>.</li>
            <li>Tap <strong>Add a record</strong>, then <strong>URL / URI</strong>.</li>
            <li>In the format list choose <strong className="font-mono">{prefix}</strong>.</li>
            <li>
              Paste this address:{" "}
              <code className="break-all rounded bg-paper px-1.5 py-0.5 font-mono text-primary">{rest.trim()}</code>{" "}
              <button type="button" onClick={copyRest} className="font-semibold text-primary underline" aria-live="polite">{copied ? "Copied" : "Copy"}</button>
            </li>
            <li>Tap <strong>OK</strong>, then <strong>Write</strong>, and hold the card to the phone.</li>
          </ol>
        </div>
      ) : null}

      {status.kind !== "idle" && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${
          status.kind === "ok" ? "bg-emerald-50 text-emerald-900" : status.kind === "error" ? "bg-red-50 text-red-800" : "bg-secondary-soft text-primary-dark"
        }`}>
          {status.kind === "waiting" && <span className="mr-2 inline-block h-2 w-2 animate-ping rounded-full bg-primary align-middle" />}
          {status.text}
        </p>
      )}
    </div>
  );
}
