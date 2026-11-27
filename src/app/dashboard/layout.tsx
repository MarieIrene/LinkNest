import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { APP_URL, isAdminEmail } from "@/lib/site";
import { DashboardProvider } from "@/components/dashboard/DashboardContext";
import { UserShell } from "@/components/dashboard/UserShell";

export const dynamic = "force-dynamic";

/** Loads the user's profile and links once for all dashboard pages. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true,
      views: true, cardTaps: true, suspended: true, contactSaves: true,
      jobTitle: true, company: true, phone: true, whatsapp: true, publicEmail: true, location: true,
      cards: { orderBy: { createdAt: "asc" }, select: { id: true, code: true, type: true, status: true, taps: true, lastTapAt: true } },
      links: {
        orderBy: { position: "asc" },
        select: { id: true, title: true, url: true, platform: true, isActive: true, clicks: true, position: true },
      },
    },
  });
  // The session points to an account that no longer exists: clear it.
  if (!user) redirect("/api/auth/logout");

  const { links, cards, ...profile } = user;
  return (
    <DashboardProvider initialProfile={profile} initialLinks={links} initialCards={cards.map((c) => ({ ...c, lastTapAt: c.lastTapAt?.toISOString() ?? null }))} appUrl={APP_URL} isAdmin={isAdminEmail(profile.email)}>
      <UserShell>{children}</UserShell>
    </DashboardProvider>
  );
}
