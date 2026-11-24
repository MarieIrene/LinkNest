import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const [newBookings, me] = await Promise.all([
    prisma.booking.count({ where: { status: "new" } }),
    prisma.user.findUnique({ where: { id: admin.id }, select: { avatarUrl: true } }),
  ]);

  return (
    <AppShell
      area="admin"
      nav={[
        { href: "/admin", label: "Overview", icon: "grid", exact: true },
        { href: "/admin/bookings", label: "Bookings", icon: "bookings", badge: newBookings },
        { href: "/admin/users", label: "Users", icon: "users" },
      ]}
      user={{ name: admin.displayName || admin.username, email: admin.email, avatarUrl: me?.avatarUrl }}
      switchTo={{ href: "/dashboard", label: "My dashboard", icon: "home" }}
    >
      {children}
    </AppShell>
  );
}
