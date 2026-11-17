"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { LinkPage } from "@/components/LinkPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import type { DashboardLink, DashboardProfile } from "@/lib/types";
import { AddLinkForm } from "./AddLinkForm";
import { LinkList } from "./LinkList";
import { ProfileForm } from "./ProfileForm";
import { ShareBar } from "./ShareBar";

type Props = { initialProfile: DashboardProfile; initialLinks: DashboardLink[]; appUrl: string };

export function Dashboard({ initialProfile, initialLinks, appUrl }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [links, setLinks] = useState(initialLinks);
  const publicUrl = `${appUrl}/${profile.username}`;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Logo />
          <div className="ml-auto flex items-center gap-1">
            <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              View page
            </a>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-ghost">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <ShareBar url={publicUrl} views={profile.views} clicks={totalClicks} />

          <section aria-labelledby="links-heading" className="space-y-4">
            <h2 id="links-heading" className="font-display text-2xl font-bold text-primary">Links</h2>
            <AddLinkForm onCreated={(link) => setLinks((prev) => [...prev, link])} />
            <LinkList links={links} setLinks={setLinks} />
          </section>

          <section aria-labelledby="profile-heading" className="space-y-4">
            <h2 id="profile-heading" className="font-display text-2xl font-bold text-primary">Profile</h2>
            <ProfileForm profile={profile} appUrl={appUrl} onSaved={setProfile} />
          </section>
        </div>

        <aside className="hidden lg:block" aria-label="Live preview">
          <div className="sticky top-24">
            <p className="mb-3 text-center text-sm text-ink/60">Live preview</p>
            <PhoneFrame>
              <LinkPage
                mode="preview"
                username={profile.username}
                displayName={profile.displayName}
                bio={profile.bio}
                avatarUrl={profile.avatarUrl}
                links={links.filter((l) => l.isActive)}
              />
            </PhoneFrame>
          </div>
        </aside>
      </main>
    </div>
  );
}
