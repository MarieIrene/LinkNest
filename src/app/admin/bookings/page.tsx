import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUSES } from "@/lib/bookings";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { BookingCard } from "@/components/admin/BookingCard";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Bookings" };

const PAGE_SIZE = 100;

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status: rawStatus, q: rawQ } = await searchParams;
  const status = BOOKING_STATUSES.some((s) => s.id === rawStatus) ? rawStatus : undefined;
  const q = rawQ?.trim().slice(0, 80) || undefined;

  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [bookings, counts] = await Promise.all([
    prisma.booking.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  const tabHref = (s?: string) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/admin/bookings${qs ? `?${qs}` : ""}`;
  };

  const tabs = [
    { id: undefined as string | undefined, label: "All", count: total },
    ...BOOKING_STATUSES.map((s) => ({ id: s.id as string | undefined, label: s.label, count: countOf[s.id] ?? 0 })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Call each new customer, then move the booking along as the order progresses."
        actions={
          <form action="/admin/bookings" className="flex w-full gap-2 sm:w-auto">
            {status && <input type="hidden" name="status" value={status} />}
            <label htmlFor="booking-search" className="sr-only">Search bookings</label>
            <input id="booking-search" name="q" defaultValue={q} placeholder="Search name, phone or email" className="field min-w-0 sm:w-72" />
            <button type="submit" className="btn-primary">Search</button>
          </form>
        }
      />

      <nav aria-label="Filter by status" className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const active = t.id === status;
          return (
            <Link
              key={t.label}
              href={tabHref(t.id)}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? "border-primary bg-primary text-white" : "border-line bg-white text-ink/75 hover:border-primary/40"
              }`}
            >
              {t.label} <span className={active ? "text-secondary" : "text-ink/45"}>{t.count}</span>
            </Link>
          );
        })}
      </nav>

      {q && (
        <p className="text-sm text-ink/65">
          {bookings.length} {bookings.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;.{" "}
          <Link href={tabHref(status)} className="font-medium text-primary hover:underline">Clear search</Link>
        </p>
      )}

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-ink/65">
          {total === 0 ? "No bookings yet. They appear here when someone books from the landing page." : "No bookings match this filter."}
        </p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={{
                id: b.id,
                productName: PRODUCTS[b.product as ProductId]?.name ?? b.product,
                price: PRODUCTS[b.product as ProductId]?.price ?? 0,
                quantity: b.quantity,
                name: b.name,
                phone: b.phone,
                email: b.email,
                message: b.message,
                status: b.status,
                notes: b.notes,
                createdAt: b.createdAt.toISOString(),
                updatedAt: b.updatedAt.toISOString(),
              }}
            />
          ))}
        </ul>
      )}
      {bookings.length === PAGE_SIZE && (
        <p className="text-sm text-ink/55">Showing the newest {PAGE_SIZE}. Use the filters or search to find older bookings.</p>
      )}
    </div>
  );
}
