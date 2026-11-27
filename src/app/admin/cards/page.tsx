import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { formatDate } from "@/lib/dates";
import { Card, PageHeader } from "@/components/ui";
import { CreateCardsForm } from "@/components/cards/CardForms";
import { CardStatusBadge } from "@/components/cards/CardBits";

export const metadata: Metadata = { title: "Cards" };

const PAGE_SIZE = 100;
const FILTERS = [
  { id: undefined, label: "All" },
  { id: "unassigned", label: "Not given yet" },
  { id: "assigned", label: "Given to someone" },
  { id: "off", label: "Switched off" },
] as const;

type Props = { searchParams: Promise<{ filter?: string; q?: string; type?: string; quantity?: string; assign?: string }> };

export default async function AdminCardsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.id === sp.filter)?.id;
  const q = sp.q?.trim().slice(0, 80) || undefined;

  const where: Prisma.CardWhereInput = {
    ...(filter === "unassigned" ? { userId: null, status: "active" } : {}),
    ...(filter === "assigned" ? { userId: { not: null }, status: "active" } : {}),
    ...(filter === "off" ? { status: "disabled" } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q.toUpperCase() } },
            { label: { contains: q, mode: "insensitive" } },
            { user: { username: { contains: q.toLowerCase().replace(/^@/, "") } } },
            { user: { displayName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [cards, counts] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: { id: true, code: true, type: true, label: true, status: true, taps: true, lastTapAt: true, createdAt: true,
        user: { select: { username: true, displayName: true } } },
    }),
    Promise.all([
      prisma.card.count(),
      prisma.card.count({ where: { userId: null, status: "active" } }),
      prisma.card.count({ where: { userId: { not: null }, status: "active" } }),
      prisma.card.count({ where: { status: "disabled" } }),
    ]),
  ]);
  const countFor = { undefined: counts[0], unassigned: counts[1], assigned: counts[2], off: counts[3] } as Record<string, number>;

  const href = (f?: string) => {
    const p = new URLSearchParams();
    if (f) p.set("filter", f);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/cards${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cards"
        description="Every physical card has its own short code. Create cards, give them to customers, write them and switch off lost ones."
        actions={
          <form action="/admin/cards" className="flex w-full gap-2 sm:w-auto">
            {filter && <input type="hidden" name="filter" value={filter} />}
            <label htmlFor="card-search" className="sr-only">Search cards</label>
            <input id="card-search" name="q" defaultValue={q} placeholder="Code, note or username" className="field min-w-0 sm:w-64" />
            <button type="submit" className="btn-primary">Search</button>
          </form>
        }
      />

      <Card id="new-cards" title="Create cards" description="Each card gets a unique code like A7K2QX. Write it onto the chip from the card's page.">
        <CreateCardsForm defaults={{ type: sp.type, quantity: sp.quantity, assignTo: sp.assign }} />
      </Card>

      <nav aria-label="Filter cards" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <Link key={f.label} href={href(f.id)} aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                active ? "border-primary bg-primary text-white" : "border-line bg-white text-ink/75 hover:border-primary/40"
              }`}>
              {f.label} <span className={active ? "text-secondary" : "text-ink/45"}>{countFor[String(f.id)]}</span>
            </Link>
          );
        })}
      </nav>

      {cards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-ink/65">
          {counts[0] === 0 ? "No cards yet. Create your first ones above." : "No cards match."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {cards.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/cards/${c.id}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xl font-bold tracking-[0.2em] text-ink">{c.code}</p>
                    <p className="text-sm text-ink/60">{PRODUCTS[c.type as ProductId]?.name ?? c.type}{c.label ? ` · ${c.label}` : ""}</p>
                  </div>
                  <CardStatusBadge status={c.status} assigned={Boolean(c.user)} />
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                  <span className="min-w-0 truncate text-ink/75">
                    {c.user ? <>{c.user.displayName || c.user.username} <span className="text-ink/50">@{c.user.username}</span></> : <span className="text-ink/45">No owner</span>}
                  </span>
                  <span className="shrink-0 text-ink/55">{c.taps} taps{c.lastTapAt ? ` · ${formatDate(c.lastTapAt)}` : ""}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {cards.length === PAGE_SIZE && <p className="text-sm text-ink/55">Showing the newest {PAGE_SIZE}. Search to find older cards.</p>}
    </div>
  );
}
