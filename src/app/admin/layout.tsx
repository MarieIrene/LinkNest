import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const newBookings = await prisma.booking.count({ where: { status: "new" } });

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <Logo />
          <span className="hidden rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-secondary sm:inline">Admin</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-ink/60 md:inline">{admin.email}</span>
            <Link href="/dashboard" className="btn-ghost whitespace-nowrap px-2.5 text-sm sm:px-4 sm:text-base">My dashboard</Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-ghost whitespace-nowrap px-2.5 text-sm sm:px-4 sm:text-base">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-8">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <AdminNav newBookings={newBookings} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
