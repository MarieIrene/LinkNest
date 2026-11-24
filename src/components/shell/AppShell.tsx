"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { APP_NAME } from "@/lib/site";
import { Icon, type IconName } from "./icons";
import { InstallAppButton } from "./InstallAppButton";

export type NavItem = { href: string; label: string; icon: IconName; badge?: number; exact?: boolean };

type Props = {
  area: "user" | "admin";
  nav: NavItem[];
  user: { name: string; email: string; avatarUrl?: string | null };
  /** Link to the other area, e.g. "Admin panel" or "My dashboard". */
  switchTo?: { href: string; label: string; icon: IconName };
  children: React.ReactNode;
};

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Brand({ area, compact = false }: { area: Props["area"]; compact?: boolean }) {
  return (
    <Link href={area === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2.5 rounded-lg" aria-label={`${APP_NAME} home`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#5EEAD4" />
        <rect x="7" y="9" width="18" height="5" rx="2.5" fill="#164E63" />
        <rect x="7" y="18" width="18" height="5" rx="2.5" fill="#164E63" opacity=".55" />
      </svg>
      <span className={`font-display text-lg font-bold tracking-tight ${compact ? "hidden min-[400px]:inline" : ""}`}>{APP_NAME}</span>
      {area === "admin" && (
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-dark">Admin</span>
      )}
    </Link>
  );
}

/**
 * The frame around the signed-in app: a dark sidebar on large screens; on phones and
 * tablets a slim top bar plus a bottom tab bar, like a native app.
 */
export function AppShell({ area, nav, user, switchTo, children }: Props) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  // Close the phone account menu after moving to another page.
  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-paper lg:pl-64">
      {/* ---------- Sidebar (large screens) ---------- */}
      <aside className="on-dark fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary-dark text-white lg:flex">
        <div className="px-5 pb-6 pt-6"><Brand area={area} /></div>

        <nav aria-label={area === "admin" ? "Admin" : "Dashboard"} className="flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            {area === "admin" ? "Manage" : "Your page"}
          </p>
          {nav.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-secondary" />}
                <Icon name={item.icon} className={active ? "text-secondary" : "text-white/55 group-hover:text-white"} />
                {item.label}
                {!!item.badge && (
                  <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary-dark">
                    {item.badge}<span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 px-3 pb-3">
          {switchTo && (
            <Link href={switchTo.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-white/65 hover:bg-white/5 hover:text-white">
              <Icon name={switchTo.icon} className="text-white/55" /> {switchTo.label}
            </Link>
          )}
          <InstallAppButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-white/65 hover:bg-white/5 hover:text-white" />
        </div>

        <div className="m-3 rounded-2xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatarUrl} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-white/55">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <button type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:border-red-300/50 hover:bg-red-500/15 hover:text-white">
              <Icon name="logout" size={18} /> Log out
            </button>
          </form>
        </div>
      </aside>

      {/* ---------- Top bar (phones & tablets) ---------- */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4 text-primary">
          <Brand area={area} compact />
          <form action="/api/auth/logout" method="post" className="ml-auto">
            <button type="submit"
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink/80 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
              <Icon name="logout" size={17} /> Log out
            </button>
          </form>
          <details ref={menuRef} className="group relative">
            <summary className="flex cursor-pointer list-none items-center rounded-full p-0.5 ring-primary/30 hover:ring-2 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Account menu</span>
              <Avatar name={user.name} src={user.avatarUrl} size={34} />
            </summary>
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white text-ink shadow-xl">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-ink/60">{user.email}</p>
              </div>
              <div className="p-1.5">
                {switchTo && (
                  <Link href={switchTo.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-primary-soft">
                    <Icon name={switchTo.icon} className="text-primary" /> {switchTo.label}
                  </Link>
                )}
                <InstallAppButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-primary-soft [&_svg]:text-primary" />
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-700 hover:bg-red-50">
                    <Icon name="logout" /> Log out
                  </button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-14 lg:pt-10">{children}</main>

      {/* ---------- Bottom tab bar (phones & tablets) ---------- */}
      <nav
        aria-label={area === "admin" ? "Admin" : "Dashboard"}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
          {nav.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] font-semibold ${active ? "text-primary" : "text-ink/55"}`}
                >
                  {active && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-primary" />}
                  <span className="relative">
                    <Icon name={item.icon} size={22} />
                    {!!item.badge && (
                      <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-amber-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
