"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/client-api";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { formatDate } from "@/lib/dates";
import { Card, PageHeader } from "@/components/ui";
import { CardQr, CardStatusBadge } from "@/components/cards/CardBits";
import { NfcWriter } from "@/components/cards/NfcWriter";
import { useDashboard } from "./DashboardContext";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copy this link:", text);
    }
  };
  return { copied, copy };
}

/** Short summary for the Overview page. */
export function CardSummary() {
  const { cards, profile } = useDashboard();
  const active = cards.filter((c) => c.status === "active");
  return (
    <div className="space-y-4">
      {cards.length > 0 ? (
        <ul className="space-y-2">
          {cards.slice(0, 3).map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
              <span className="font-mono font-bold tracking-[0.18em] text-ink">{c.code}</span>
              <span className="truncate text-sm text-ink/60">{PRODUCTS[c.type as ProductId]?.name ?? c.type}</span>
              <span className="ml-auto shrink-0 text-sm text-ink/55">{c.taps} taps</span>
              <CardStatusBadge status={c.status} assigned />
            </li>
          ))}
        </ul>
      ) : (
        <p className="leading-relaxed text-ink/70">
          No card linked to your account yet. When someone taps your card on an NFC-enabled phone, your profile opens instantly
          {profile.cardTaps > 0 ? `. Your personal card link has been tapped ${profile.cardTaps} times.` : "."}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/card" className="btn-primary">{cards.length ? "Manage cards" : "Card link & QR code"}</Link>
        {active.length === 0 && <Link href="/#book" className="btn-ghost border border-line">Book a card</Link>}
      </div>
    </div>
  );
}

/** The "Card" section: each physical card with QR code, writing and "report lost". */
export function CardsView() {
  const { cards, setCards, profile, appUrl } = useDashboard();
  const { copied, copy } = useCopy();
  const [open, setOpen] = useState<string | null>(cards.length === 1 ? `write-${cards[0].id}` : null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const personalUrl = `${appUrl}/c/${profile.id}`;
  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));

  async function reportLost(id: string, code: string) {
    if (!window.confirm(`Report card ${code} as lost?\n\nIt stops working straight away, so nobody who finds it can use it. To switch it back on, call LinkNest.`)) return;
    setMessage(null);
    const res = await apiRequest(`/api/cards/${id}`, { method: "PATCH", body: { status: "disabled" } });
    if (!res.ok) return setMessage({ text: res.error, error: true });
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: "disabled" } : c)));
    setMessage({ text: `Card ${code} is switched off. Book a replacement whenever you're ready.` });
  }

  return (
    <>
      <PageHeader title="Your card" description="Your NFC card opens your profile when someone taps it. Manage each card, its QR code and what's written on it." />
      <div className="grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-6">
        {message && (
          <p role="status" className={`rounded-xl px-4 py-3 ${message.error ? "bg-red-50 text-red-800" : "bg-secondary-soft text-primary-dark"}`}>{message.text}</p>
        )}

        {cards.length === 0 && (
          <Card id="no-card" title="No card linked yet">
            <p className="text-ink/70">
              When you get a LinkNest card, we link it to your account and it appears here. You can also use your personal card link below
              with any NFC card or sticker you already have.
            </p>
            <Link href="/#book" className="btn-press mt-4">Book your card</Link>
          </Card>
        )}

        {cards.map((c) => {
          const url = `${appUrl}/c/${c.code}`;
          return (
            <Card key={c.id} id={`card-${c.code}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-2xl font-bold tracking-[0.2em] text-ink">{c.code}</p>
                  <p className="text-sm text-ink/60">
                    {PRODUCTS[c.type as ProductId]?.name ?? c.type} · {c.taps} taps{c.lastTapAt ? ` · last ${formatDate(c.lastTapAt)}` : ""}
                  </p>
                </div>
                <CardStatusBadge status={c.status} assigned />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 truncate rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-primary">{url}</code>
                <button type="button" onClick={() => copy(url)} className="btn-primary shrink-0" aria-live="polite">
                  {copied === url ? "Copied" : "Copy link"}
                </button>
              </div>

              {c.status === "active" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggle(`write-${c.id}`)} aria-expanded={open === `write-${c.id}`} className="btn-ghost border border-line">Write to card</button>
                  <button type="button" onClick={() => toggle(`qr-${c.id}`)} aria-expanded={open === `qr-${c.id}`} className="btn-ghost border border-line">QR code</button>
                  <button type="button" onClick={() => reportLost(c.id, c.code)} className="btn-ghost border border-red-200 text-red-700 hover:bg-red-50">Report lost</button>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  This card is switched off. Tapping it shows &ldquo;no longer active&rdquo;. Call 0784424423 to switch it back on.
                </p>
              )}

              {open === `write-${c.id}` && <div className="mt-5 border-t border-line pt-5"><NfcWriter url={url} cardLabel={`card ${c.code}`} /></div>}
              {open === `qr-${c.id}` && <div className="mt-5 border-t border-line pt-5"><CardQr id={c.code} size={180} /></div>}
            </Card>
          );
        })}

        <Card id="personal" title="Personal card link" description="Works with any NFC card or sticker, and never changes">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-primary">{personalUrl}</code>
            <button type="button" onClick={() => copy(personalUrl)} className="btn-primary shrink-0" aria-live="polite">
              {copied === personalUrl ? "Copied" : "Copy link"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => toggle("write-personal")} aria-expanded={open === "write-personal"} className="btn-ghost border border-line">Write to a card</button>
            <button type="button" onClick={() => toggle("qr-personal")} aria-expanded={open === "qr-personal"} className="btn-ghost border border-line">QR code</button>
          </div>
          {open === "write-personal" && <div className="mt-5 border-t border-line pt-5"><NfcWriter url={personalUrl} /></div>}
          {open === "qr-personal" && <div className="mt-5 border-t border-line pt-5"><CardQr id={profile.id} size={180} /></div>}
        </Card>
      </div>
    </>
  );
}
