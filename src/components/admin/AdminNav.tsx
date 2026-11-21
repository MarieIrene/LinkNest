"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview", icon: <path d="M3 12l9-8 9 8M5 10v10h14V10" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></> },
  { href: "/admin/users", label: "Users", icon: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2a5 5 0 0 1 5.5 4.8" /></> },
];

/** Admin menu: a column on large screens, a row of tabs on phones. */
export function AdminNav({ newBookings }: { newBookings: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="grid grid-cols-3 gap-1 lg:flex lg:flex-col">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors sm:text-base lg:justify-start lg:gap-3 lg:px-3 ${
              active ? "bg-primary text-white" : "text-ink/75 hover:bg-primary-soft hover:text-primary"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="hidden shrink-0 sm:block">{item.icon}</svg>
            {item.label}
            {item.href === "/admin/bookings" && newBookings > 0 && (
              <span className={`rounded-full lg:ml-auto px-2 py-0.5 text-xs font-bold ${active ? "bg-secondary text-primary-dark" : "bg-amber-100 text-amber-900"}`}>
                {newBookings}
                <span className="sr-only"> new</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
