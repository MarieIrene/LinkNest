"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/shell/icons";
import { useDashboard } from "./DashboardContext";
import { WithPreview } from "./LivePreview";
import { AddLinkForm } from "./AddLinkForm";
import { LinkList } from "./LinkList";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function LinksView() {
  const { links, setLinks } = useDashboard();
  const active = links.filter((l) => l.isActive).length;
  return (
    <>
      <PageHeader title="Links" description="Add your socials, website, WhatsApp and more. Reorder them or hide any link without deleting it." />
      <WithPreview>
        <AddLinkForm onCreated={(link) => setLinks((prev) => [...prev, link])} />
        <div>
          <h2 className="mb-3 flex items-baseline justify-between font-display text-lg font-bold text-ink">
            Your links
            <span className="text-sm font-normal text-ink/55">{active} shown · {links.length - active} hidden</span>
          </h2>
          <LinkList links={links} setLinks={setLinks} />
        </div>
      </WithPreview>
    </>
  );
}

export function ProfileView() {
  const { profile, setProfile, appUrl } = useDashboard();
  return (
    <>
      <PageHeader title="Profile" description="Your name, photo and bio, as people see them when they tap your card." />
      <WithPreview>
        <ProfileForm profile={profile} appUrl={appUrl} onSaved={setProfile} />
      </WithPreview>
    </>
  );
}

export function SettingsView() {
  const { profile, appUrl } = useDashboard();
  const [copied, setCopied] = useState<string | null>(null);
  const rows = [
    { label: "Email", value: profile.email },
    { label: "Username", value: `@${profile.username}` },
    { label: "Page address", value: `${appUrl}/${profile.username}`, copy: true },
    { label: "Card link", value: `${appUrl}/c/${profile.id}`, copy: true },
  ];

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copy:", text);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Your account details and password." />
      <div className="grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-6">
        <Card id="account" title="Account" action={<Link href="/dashboard/profile" className="text-sm font-medium text-primary hover:underline">Edit profile</Link>}>
          <dl className="divide-y divide-line">
            {rows.map((r) => (
              <div key={r.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt className="w-32 shrink-0 text-sm font-medium text-ink/55">{r.label}</dt>
                <dd className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-ink">{r.value}</span>
                  {r.copy && (
                    <button type="button" onClick={() => copy(r.value)} className="btn-ghost shrink-0 px-3 py-1 text-sm" aria-live="polite">
                      {copied === r.value ? "Copied" : "Copy"}
                    </button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Change password</h2>
          <ChangePasswordForm />
        </div>

        <Card id="help" title="Need help?">
          <p className="text-ink/70">
            Questions about your card or account? Call Arvash Tech on{" "}
            <a href="tel:0784424423" className="font-semibold text-primary hover:underline">0784424423</a> or{" "}
            <a href="tel:0786729283" className="font-semibold text-primary hover:underline">0786729283</a>.
          </p>
          <form action="/api/auth/logout" method="post" className="mt-4">
            <button type="submit" className="btn-ghost gap-2 border border-red-200 text-red-700 hover:bg-red-50">
              <Icon name="logout" size={18} /> Log out
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
