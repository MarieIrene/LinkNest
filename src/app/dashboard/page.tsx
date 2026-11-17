import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { APP_URL } from "@/lib/site";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      views: true,
      links: {
        orderBy: { position: "asc" },
        select: { id: true, title: true, url: true, isActive: true, clicks: true, position: true },
      },
    },
  });
  // The session points to an account that no longer exists: clear it.
  if (!user) redirect("/api/auth/logout");

  const { links, ...profile } = user;
  return <Dashboard initialProfile={profile} initialLinks={links} appUrl={APP_URL} />;
}
