import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { APP_URL, cardUrl, isAdminEmail } from "@/lib/site";
import { bookingStatus } from "@/lib/bookings";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { PlatformIcon } from "@/lib/platforms";
import { Avatar } from "@/components/Avatar";
import { formatDate } from "@/lib/dates";
import { CopyButton, UserActions } from "@/components/admin/UserActions";

export const metadata: Metadata = { title: "User" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserPage({ params }: Props) {
  const { id } = await params;
  const [admin, user] = await Promise.all([
    getAdmin(),
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true,
        views: true, cardTaps: true, suspended: true, createdAt: true,
        links: { orderBy: { position: "asc" }, select: { id: true, title: true, url: true, platform: true, isActive: true, clicks: true } },
      },
    }),
  ]);
  if (!user) notFound();

  const bookings = await prisma.booking.findMany({
    where: { email: { equals: user.email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const name = user.displayName || user.username;
  const userIsAdmin = isAdminEmail(user.email);
  const card = cardUrl(user.id);
  const totalClicks = user.links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">&larr; All users</Link>

      <section className="panel flex flex-wrap items-center gap-5">
        <Avatar name={name} src={user.avatarUrl} size={88} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-primary">{name}</h1>
            {userIsAdmin && <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-secondary">Admin</span>}
            {user.suspended && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Suspended</span>}
          </div>
          <p className="text-ink/65">@{user.username} · {user.email}</p>
          {user.bio && <p className="mt-2 max-w-[60ch] text-ink/80">{user.bio}</p>}
          <p className="mt-2 text-sm text-ink/55">Joined {formatDate(user.createdAt, "long")}</p>
        </div>
        <a href={`/${user.username}`} target="_blank" rel="noopener noreferrer" className="btn-ghost border border-line">View public page</a>
      </section>

      {user.suspended && (
        <p role="status" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
          This account is suspended. Their public page and card show &ldquo;This page is unavailable&rdquo;.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Page views", value: user.views },
          { label: "Card taps", value: user.cardTaps },
          { label: "Link clicks", value: totalClicks },
        ].map((s) => (
          <li key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink/65">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary">{s.value.toLocaleString()}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="card-heading" className="panel space-y-3">
        <h2 id="card-heading" className="font-display text-xl font-bold text-primary">NFC card link</h2>
        <p className="text-ink/70">Write this link onto the customer&apos;s card or tag. It keeps working if they change their username.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-primary">{card}</code>
          <CopyButton text={card} label="Copy card link" />
        </div>
        <p className="text-sm text-ink/55">Profile address: {APP_URL.replace(/^https?:\/\//, "")}/{user.username}</p>
      </section>

      <section aria-labelledby="actions-heading" className="panel space-y-3">
        <h2 id="actions-heading" className="font-display text-xl font-bold text-primary">Account actions</h2>
        <UserActions
          userId={user.id}
          username={user.username}
          email={user.email}
          suspended={user.suspended}
          protectedAccount={userIsAdmin || user.id === admin?.id}
        />
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
        <section aria-labelledby="links-heading" className="panel">
          <h2 id="links-heading" className="font-display text-xl font-bold text-primary">Links ({user.links.length})</h2>
          {user.links.length === 0 ? (
            <p className="mt-3 text-ink/60">No links yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {user.links.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <PlatformIcon id={l.platform} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">
                      {l.title} {!l.isActive && <span className="text-xs font-normal text-ink/50">(hidden)</span>}
                    </p>
                    <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="block truncate text-sm text-ink/60 hover:text-primary">{l.url}</a>
                  </div>
                  <span className="shrink-0 text-sm text-ink/55">{l.clicks} clicks</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="ub-heading" className="panel">
          <h2 id="ub-heading" className="font-display text-xl font-bold text-primary">Bookings with this email</h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-ink/60">None. Bookings are matched by email address, so ones made with a different email won&apos;t show here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {bookings.map((b) => {
                const s = bookingStatus(b.status);
                return (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span>
                      {b.quantity} × {PRODUCTS[b.product as ProductId]?.name ?? b.product}
                      <span className="ml-2 text-sm text-ink/55">{formatDate(b.createdAt)}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.tone}`}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
