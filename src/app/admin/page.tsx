import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUSES, PAID_STATUSES } from "@/lib/bookings";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { Avatar } from "@/components/Avatar";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { ColumnChart, type ColumnDatum } from "@/components/charts/ColumnChart";
import { formatDayMonth as shortDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Overview" };

const DAY = 24 * 60 * 60 * 1000;
const KIGALI_OFFSET = 2 * 60 * 60 * 1000; // Rwanda is UTC+2 all year.
const CHART_DAYS = 30;
const rwf = (n: number) => `${n.toLocaleString("en-US")} RWF`;

/** Kigali calendar day (YYYY-MM-DD) for a timestamp. */
const dayKey = (d: Date | number) => new Date(new Date(d).getTime() + KIGALI_OFFSET).toISOString().slice(0, 10);

/** Counts per Kigali day for the last CHART_DAYS days, oldest first, including empty days. */
function perDay(dates: Date[]): ColumnDatum[] {
  const counts = new Map<string, number>();
  for (const d of dates) counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1);
  return Array.from({ length: CHART_DAYS }, (_, i) => {
    const t = Date.now() - (CHART_DAYS - 1 - i) * DAY;
    const key = dayKey(t);
    const asDate = new Date(`${key}T12:00:00Z`);
    return {
      key,
      label: asDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }),
      shortLabel: asDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      value: counts.get(key) ?? 0,
    };
  });
}

export default async function AdminOverviewPage() {
  const weekAgo = new Date(Date.now() - 7 * DAY);
  const chartStart = new Date(Date.now() - CHART_DAYS * DAY);

  const [users, newUsers, suspended, totals, bookingsByStatus, paidByProduct, newBookingsWeek, waiting, latestUsers, recentBookings, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { suspended: true } }),
      prisma.user.aggregate({ _sum: { views: true, cardTaps: true } }),
      prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.booking.groupBy({ by: ["product"], where: { status: { in: PAID_STATUSES } }, _sum: { quantity: true } }),
      prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.booking.findMany({ where: { status: "new" }, orderBy: { createdAt: "asc" }, take: 5 }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, createdAt: true },
      }),
      prisma.booking.findMany({ where: { createdAt: { gte: chartStart } }, select: { createdAt: true } }),
      prisma.user.findMany({ where: { createdAt: { gte: chartStart } }, select: { createdAt: true } }),
    ]);

  const statusCount = Object.fromEntries(bookingsByStatus.map((b) => [b.status, b._count._all]));
  const totalBookings = bookingsByStatus.reduce((sum, b) => sum + b._count._all, 0);
  const revenue = paidByProduct.reduce(
    (sum, p) => sum + (p._sum.quantity ?? 0) * (PRODUCTS[p.product as ProductId]?.price ?? 0),
    0,
  );
  const waitingCount = statusCount.new ?? 0;

  return (
    <>
      <PageHeader
        title="Overview"
        description="How LinkNest is doing today."
        actions={
          waitingCount > 0 ? (
            <Link href="/admin/bookings?status=new" className="btn-primary">Call {waitingCount} new {waitingCount === 1 ? "customer" : "customers"}</Link>
          ) : undefined
        }
      />

      <div className="min-w-0 space-y-6">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          <li><StatCard label="Waiting for a call" value={waitingCount} icon="phone" tone="amber" href="/admin/bookings?status=new" highlight={waitingCount > 0} /></li>
          <li><StatCard label="Revenue (paid orders)" value={rwf(revenue)} icon="money" tone="green" href="/admin/bookings?status=paid" /></li>
          <li><StatCard label="Bookings" value={totalBookings} sub={`+${newBookingsWeek} this week`} icon="bookings" tone="blue" href="/admin/bookings" /></li>
          <li><StatCard label="Users" value={users} sub={`+${newUsers} this week`} icon="users" tone="teal" href="/admin/users" /></li>
          <li><StatCard label="Orders delivered" value={statusCount.delivered ?? 0} icon="check" tone="green" href="/admin/bookings?status=delivered" /></li>
          <li><StatCard label="Card taps" value={(totals._sum.cardTaps ?? 0).toLocaleString()} sub={`${(totals._sum.views ?? 0).toLocaleString()} page views`} icon="tap" tone="violet" /></li>
        </ul>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
          <Card id="bookings-chart" title="Bookings per day" description={`Last ${CHART_DAYS} days, Kigali time`}>
            <ColumnChart data={perDay(recentBookings.map((b) => b.createdAt))} unit={["booking", "bookings"]} />
          </Card>
          <Card id="users-chart" title="New users per day" description={`Last ${CHART_DAYS} days, Kigali time`}>
            <ColumnChart data={perDay(recentUsers.map((u) => u.createdAt))} unit={["sign-up", "sign-ups"]} />
          </Card>
        </div>

        <Card id="pipeline" title="Orders by step" description="Click a step to see those bookings">
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {BOOKING_STATUSES.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/bookings?status=${s.id}`} className="block rounded-xl border border-line p-3 transition hover:border-primary/40 hover:bg-paper">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${s.tone}`}>{s.label}</span>
                  <p className="mt-2 font-display text-2xl font-bold text-ink">{statusCount[s.id] ?? 0}</p>
                </Link>
              </li>
            ))}
          </ol>
        </Card>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
          <Card id="waiting" title="Needs a call" description="Oldest first"
            action={<Link href="/admin/bookings?status=new" className="text-sm font-medium text-primary hover:underline">All new bookings</Link>}>
            {waiting.length === 0 ? (
              <p className="py-4 text-ink/60">Nothing waiting. Every booking has been handled.</p>
            ) : (
              <ul className="-my-3 divide-y divide-line">
                {waiting.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{b.name}</p>
                      <p className="text-sm text-ink/60">
                        {b.quantity} × {PRODUCTS[b.product as ProductId]?.name ?? b.product} · {shortDate(b.createdAt)}
                      </p>
                    </div>
                    <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="btn-primary px-4 py-2 text-sm">Call {b.phone}</a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card id="newest" title="Newest users"
            action={<Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">All users</Link>}>
            <ul className="-my-3 divide-y divide-line">
              {latestUsers.map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-paper">
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
            {suspended > 0 && <p className="mt-4 text-sm text-ink/60">{suspended} suspended {suspended === 1 ? "account" : "accounts"}.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
