import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LinkPage } from "@/components/LinkPage";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }> };

const getProfile = cache(async (raw: string) => {
  const username = decodeURIComponent(raw).toLowerCase();
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      links: { where: { isActive: true }, orderBy: { position: "asc" }, select: { id: true, title: true, url: true } },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getProfile((await params).username);
  if (!user) return { title: "Page not found" };
  const name = user.displayName || user.username;
  return {
    title: `${name} (@${user.username})`,
    description: user.bio ?? `All of ${name}'s links in one place.`,
    openGraph: { title: name, description: user.bio ?? undefined, images: user.avatarUrl ? [user.avatarUrl] : undefined },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const user = await getProfile((await params).username);
  if (!user) notFound();

  // Count the visit; a failure here should never block the page.
  await prisma.user.update({ where: { id: user.id }, data: { views: { increment: 1 } } }).catch(() => undefined);

  return (
    <main className="flex min-h-dvh flex-col bg-primary">
      <LinkPage
        username={user.username}
        displayName={user.displayName}
        bio={user.bio}
        avatarUrl={user.avatarUrl}
        links={user.links}
      />
    </main>
  );
}
