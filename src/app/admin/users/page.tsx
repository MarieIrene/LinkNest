import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/site";
import { Avatar } from "@/components/Avatar";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Users" };

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<{ q?: string; filter?: string; page?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q: rawQ, filter: rawFilter, page: rawPage } = await searchParams;
  const q = rawQ?.trim().slice(0, 80) || undefined;
  const filter = rawFilter === "suspended" ? "suspended" : undefined;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const where: Prisma.UserWhereInput = {
    ...(filter === "suspended" ? { suspended: true } : {}),
    ...(q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total, suspendedCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, username: true, displayName: true, email: true, avatarUrl: true,
        views: true, cardTaps: true, suspended: true, createdAt: true,
        _count: { select: { links: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { suspended: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (changes: { q?: string; filter?: string; page?: number }) => {
    const params = new URLSearchParams();
    const next = { q, filter, page: undefined as number | undefined, ...changes };
    if (next.q) params.set("q", next.q);
    if (next.filter) params.set("filter", next.filter);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Users</h1>
          <p className="mt-1 text-ink/65">Look up a customer to copy their card link, help them log in or suspend their page.</p>
        </div>
        <form action="/admin/users" className="flex w-full gap-2 sm:w-auto">
          {filter && <input type="hidden" name="filter" value={filter} />}
          <label htmlFor="user-search" className="sr-only">Search users</label>
          <input id="user-search" name="q" defaultValue={q} placeholder="Search name, username or email" className="field sm:w-72" />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <nav aria-label="Filter users" className="flex gap-2">
        {[
          { id: undefined, label: "All users" },
          { id: "suspended", label: `Suspended (${suspendedCount})` },
        ].map((t) => {
          const active = t.id === filter;
          return (
            <Link key={t.label} href={href({ filter: t.id })} aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                active ? "border-primary bg-primary text-white" : "border-line bg-white text-ink/75 hover:border-primary/40"
              }`}>
              {t.label}
            </Link>
          );
        })}
      </nav>

      <p className="text-sm text-ink/65">
        {total} {total === 1 ? "user" : "users"}{q && <> matching &ldquo;{q}&rdquo;. <Link href={href({ q: undefined })} className="font-medium text-primary hover:underline">Clear search</Link></>}
      </p>

      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-ink/65">No users match.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-primary-soft text-primary">
              <tr>
                {["User", "Email", "Joined", "Links", "Views", "Card taps", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 font-semibold text-ink hover:text-primary">
                      <Avatar name={u.displayName || u.username} src={u.avatarUrl} size={36} />
                      <span className="min-w-0">
                        <span className="block truncate">{u.displayName || u.username}</span>
                        <span className="block truncate text-xs font-normal text-ink/55">@{u.username}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink/75">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/70">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">{u._count.links}</td>
                  <td className="px-4 py-3">{u.views.toLocaleString()}</td>
                  <td className="px-4 py-3">{u.cardTaps.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {isAdminEmail(u.email) ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-secondary">Admin</span>
                    ) : u.suspended ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Suspended</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between">
          {page > 1 ? <Link href={href({ page: page - 1 })} className="btn-ghost border border-line">Previous</Link> : <span />}
          <span className="text-sm text-ink/60">Page {page} of {pages}</span>
          {page < pages ? <Link href={href({ page: page + 1 })} className="btn-ghost border border-line">Next</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
