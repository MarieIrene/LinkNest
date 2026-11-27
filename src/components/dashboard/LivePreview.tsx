"use client";

import { LinkPage } from "@/components/LinkPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useDashboard } from "./DashboardContext";

/** Phone mock-up of the public page that updates as the person edits. Shown on wide screens. */
export function LivePreview() {
  const { profile, links } = useDashboard();
  return (
    <aside aria-label="Live preview of your page" className="hidden xl:block">
      <div className="sticky top-10">
        <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-ink/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live preview
        </p>
        <PhoneFrame>
          <LinkPage
            mode="preview"
            username={profile.username}
            displayName={profile.displayName}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
            links={links.filter((l) => l.isActive)}
            contact={profile}
          />
        </PhoneFrame>
      </div>
    </aside>
  );
}

/** Two-column page body: content on the left, the live preview on the right (wide screens only). */
export function WithPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">{children}</div>
      <LivePreview />
    </div>
  );
}
