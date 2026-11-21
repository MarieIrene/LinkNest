import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUSES, PAID_STATUSES } from "@/lib/bookings";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { Avatar } from "@/components/Avatar";
import { formatDayMonth as shortDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Overview" };

const DAY = 24 * 60 * 60 * 1000;
const rwf = (n: number) => `${n.toLocaleString("en-US")} RWF`;

export default async function AdminOverviewPage() {
  const weekAgo = new Date(Date.now() - 7 * DAY);

  const [users, newUsers, suspended, totals, bookingsByStatus, paidByProduct, newBookingsWeek, waiting, latestUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { suspended: true } }),
      prisma.user.aggregate({ _sum: { views: true, cardTaps: true } }),
      prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.booking.groupBy({ by: ["product"], where: { status: { in: PAID_STATUSES } }, _sum: { quantity: true } }),
      prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.booking.findMany({ where: { status: "new" }, orderBy: { createdAt: "asc" }, take: 6 }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, createdAt: true },
      }),
    ]);

  const statusCount = Object.fromEntries(bookingsByStatus.map((b) => [b.status, b._count._all]));
  const totalBookings = bookingsByStatus.reduce((sum, b) => sum + b._count._all, 0);
  const revenue = paidByProduct.reduce(
    (sum, p) => sum + (p._sum.quantity ?? 0) * (PRODUCTS[p.product as ProductId]?.price ?? 0),
    0,
  );
  const cardsDelivered = statusCount.delivered ?? 0;

  const stats = [
    { label: "Bookings waiting for a call", value: statusCount.new ?? 0, href: "/admin/bookings?status=new", highlight: (statusCount.new ?? 0) > 0 },
    { label: "Revenue from paid bookings", value: rwf(revenue), href: "/admin/bookings?status=paid" },
    { label: "Users", value: users, sub: `+${newUsers} this week`, href: "/admin/users" },
    { label: "Bookings", value: totalBookings, sub: `+${newBookingsWeek} this week`, href: "/admin/bookings" },
    { label: "Orders delivered", value: cardsDelivered, href: "/admin/bookings?status=delivered" },
    { label: "Card taps (all time)", value: (totals._sum.cardTaps ?? 0).toLocaleString(), sub: `${(totals._sum.views ?? 0).toLocaleString()} page views` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Overview</h1>
        <p className="mt-1 text-ink/65">How LinkNest is doing today.</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-sm text-ink/65">{s.label}</p>
              <p className={`mt-1 font-display text-3xl font-bold ${s.highlight ? "text-amber-700" : "text-primary"}`}>{s.value}</p>
              {s.sub && <p className="mt-1 text-sm text-ink/55">{s.sub}</p>}
            </>
          );
          const cls = `block h-full rounded-2xl border bg-white p-5 ${s.highlight ? "border-amber-300 ring-2 ring-amber-100" : "border-line"}`;
          return (
            <li key={s.label}>
              {s.href ? <Link href={s.href} className={`${cls} transition hover:-translate-y-0.5 hover:shadow-md`}>{body}</Link> : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="pipeline-heading" className="panel">
        <h2 id="pipeline-heading" className="font-display text-xl font-bold text-primary">Orders by step</h2>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {BOOKING_STATUSES.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/bookings?status=${s.id}`} className="block rounded-xl border border-line p-3 transition hover:border-primary/40">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${s.tone}`}>{s.label}</span>
                <p className="mt-2 font-display text-2xl font-bold text-ink">{statusCount[s.id] ?? 0}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
        <section aria-labelledby="waiting-heading" className="panel">
          <div className="flex items-baseline justify-between">
            <h2 id="waiting-heading" className="font-display text-xl font-bold text-primary">Needs a call</h2>
            <Link href="/admin/bookings?status=new" className="text-sm font-medium text-primary hover:underline">All new bookings</Link>
          </div>
          {waiting.length === 0 ? (
            <p className="mt-4 text-ink/60">Nothing waiting. Every booking has been handled.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {waiting.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{b.name}</p>
                    <p className="text-sm text-ink/60">
                      {b.quantity} × {PRODUCTS[b.product as ProductId]?.name ?? b.product} · {shortDate(b.createdAt)}
                    </p>
                  </div>
                  <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="btn-primary px-4 py-2 text-sm">Call {b.phone}</a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="newusers-heading" className="panel">
          <div className="flex items-baseline justify-between">
            <h2 id="newusers-heading" className="font-display text-xl font-bold text-primary">Newest users</h2>
            <Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">All users</Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {latestUsers.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 py-3 hover:bg-paper">
                  <Avatar name={u.displayName || u.username} src={u.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{u.displayName || u.username} <span className="font-normal text-ink/55">@{u.username}</span></p>
                    <p className="truncate text-sm text-ink/60">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-sm text-ink/55">{shortDate(u.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {suspended > 0 && <p className="mt-3 text-sm text-ink/60">{suspended} suspended {suspended === 1 ? "account" : "accounts"}.</p>}
        </section>
      </div>
    </div>
  );
}
