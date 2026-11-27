"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { Icon } from "@/components/shell/icons";
import { BarList } from "@/components/charts/BarList";
import { useDashboard } from "./DashboardContext";
import { WithPreview } from "./LivePreview";
import { CardSummary } from "./CardPanel";

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", text);
    }
  };
  return { copied, copy };
}

export function OverviewView() {
  const { profile, links, appUrl } = useDashboard();
  const { copied, copy } = useCopy();
  const publicUrl = `${appUrl}/${profile.username}`;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = links.filter((l) => l.isActive).length;
  const firstName = (profile.displayName || profile.username).split(/\s+/)[0];

  const checklist = [
    { done: Boolean(profile.avatarUrl), label: "Add a profile photo", href: "/dashboard/profile" },
    { done: Boolean(profile.bio), label: "Write a short bio", href: "/dashboard/profile" },
    { done: Boolean(profile.jobTitle), label: "Add your job title", href: "/dashboard/profile" },
    { done: Boolean(profile.phone || profile.whatsapp || profile.publicEmail), label: "Add a phone, WhatsApp or email", href: "/dashboard/profile" },
    { done: links.length > 0, label: "Add your first link", href: "/dashboard/links" },
    { done: links.length >= 3, label: "Add at least 3 links", href: "/dashboard/links" },
  ];
  const remaining = checklist.filter((c) => !c.done).length;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's how your page and card are doing."
        actions={
          <>
            <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="btn-ghost gap-2 border border-line bg-white">
              <Icon name="external" size={18} /> View page
            </a>
            <Link href="/dashboard/links" className="btn-primary gap-2"><Icon name="plus" size={18} /> Add link</Link>
          </>
        }
      />

      <WithPreview>
        {profile.suspended && (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
            <strong>Your page is suspended.</strong> Visitors and card taps see &ldquo;This page is unavailable&rdquo;.
            Contact Arvash Tech on 0784424423 to restore it.
          </p>
        )}

        {/* Share */}
        <section aria-labelledby="share-heading" className="on-dark relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white sm:p-6">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/20 blur-2xl" />
          <h2 id="share-heading" className="relative text-sm font-medium text-white/70">Your page is live at</h2>
          <div className="relative mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate font-display text-xl font-bold text-secondary underline-offset-4 hover:underline sm:text-2xl">
              {publicUrl.replace(/^https?:\/\//, "")}
            </a>
            <button type="button" onClick={() => copy(publicUrl)} className="btn-press shrink-0" aria-live="polite">
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </section>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 2xl:grid-cols-5">
          <li><StatCard label="Page views" value={profile.views.toLocaleString()} icon="eye" tone="teal" /></li>
          <li><StatCard label="Card taps" value={profile.cardTaps.toLocaleString()} icon="tap" tone="violet" /></li>
          <li><StatCard label="Contacts saved" value={profile.contactSaves.toLocaleString()} icon="profile" tone="amber" /></li>
          <li><StatCard label="Link clicks" value={totalClicks.toLocaleString()} icon="click" tone="blue" /></li>
          <li><StatCard label="Active links" value={activeLinks} sub={`of ${links.length}`} icon="links" tone="green" href="/dashboard/links" /></li>
        </ul>

        {remaining > 0 && (
          <Card title="Finish setting up your page" description={`${checklist.length - remaining} of ${checklist.length} done`}>
            <div className="mb-4 h-2 rounded-full bg-primary-soft" aria-hidden="true">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((checklist.length - remaining) / checklist.length) * 100}%` }} />
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${c.done ? "border-emerald-200 bg-emerald-50 font-medium text-ink" : "border-line hover:border-primary/40"}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-emerald-500 text-white" : "border-2 border-line"}`}>
                      {c.done && <Icon name="check" size={14} />}
                    </span>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 2xl:grid-cols-2">
          <Card id="clicks" title="Clicks per link" description="All time, most clicked first"
            action={<Link href="/dashboard/links" className="text-sm font-medium text-primary hover:underline">Manage links</Link>}>
            <BarList
              items={links.map((l) => ({ id: l.id, label: l.title, value: l.clicks, platform: l.platform }))}
              unit={["click", "clicks"]}
              empty="No links yet. Add one and its clicks will show here."
            />
          </Card>
          <Card id="nfc" title="Your NFC card" description="What happens when someone taps your card"
            action={<Link href="/dashboard/card" className="text-sm font-medium text-primary hover:underline">Manage</Link>}>
            <CardSummary />
          </Card>
        </div>
      </WithPreview>
    </>
  );
}
