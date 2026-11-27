"use client";

import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { useDashboard } from "./DashboardContext";

const nav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "home", exact: true },
  { href: "/dashboard/links", label: "Links", icon: "links" },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  { href: "/dashboard/card", label: "Card", icon: "card" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

/** The app frame for customers; reads the live profile so name and photo update right after saving. */
export function UserShell({ children }: { children: React.ReactNode }) {
  const { profile, isAdmin } = useDashboard();
  return (
    <AppShell
      area="user"
      nav={nav}
      user={{ name: profile.displayName || profile.username, email: profile.email, avatarUrl: profile.avatarUrl }}
      switchTo={isAdmin ? { href: "/admin", label: "Admin panel", icon: "shield" } : undefined}
    >
      {children}
    </AppShell>
  );
}
