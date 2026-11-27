import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = { title: "LinkNest card", robots: { index: false } };

const messages = {
  off: {
    title: "This card is no longer active",
    text: "Its owner switched it off, for example because it was lost or replaced. Ask them for their new card or link.",
  },
  new: {
    title: "This card hasn't been set up yet",
    text: "It's a brand-new LinkNest card. Once it's linked to a profile, tapping it will open that profile.",
  },
  unknown: {
    title: "We couldn't find this card",
    text: "The link on this card doesn't match any LinkNest card. Check with the person who gave it to you.",
  },
} as const;

/** Shown when a tapped card can't open a profile. */
export default async function CardStatePage({ searchParams }: { searchParams: Promise<{ state?: string; code?: string }> }) {
  const { state, code } = await searchParams;
  const m = messages[(state as keyof typeof messages) ?? "unknown"] ?? messages.unknown;

  return (
    <main className="on-dark flex min-h-dvh flex-col items-center justify-center bg-primary px-6 text-center text-white">
      <Logo dark />
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        aria-hidden="true" className="mt-10 text-secondary">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M6 8.3a6 6 0 0 1 0 7.4M9.5 6.5a9 9 0 0 1 0 11" />
      </svg>
      <h1 className="mt-6 max-w-md font-display text-3xl font-bold">{m.title}</h1>
      <p className="mt-3 max-w-sm text-white/75">{m.text}</p>
      {state === "new" && code && <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 font-mono tracking-widest">Card {code}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-press">Get your own card</Link>
        <a href={`tel:${COMPANY.phones[0]}`} className="btn-ghost border border-white/30 text-white hover:bg-white/10">Call {COMPANY.phones[0]}</a>
      </div>
    </main>
  );
}
