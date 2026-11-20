/**
 * Link types people can pick in the dashboard. Each one has an icon, a default
 * title and a helper that turns what the user typed (a handle, a phone number)
 * into a full URL.
 */

export const PLATFORM_IDS = [
  "website", "instagram", "linkedin", "facebook", "x", "tiktok",
  "youtube", "whatsapp", "email", "phone", "location", "github",
] as const;

export type PlatformId = (typeof PLATFORM_IDS)[number];

type Platform = {
  id: PlatformId;
  name: string;
  color: string;
  /** Placeholder for the URL field. */
  placeholder: string;
  /** Label for the URL field. */
  inputLabel: string;
  /** Builds a URL from a bare handle or number. Only called when the input isn't already a URL. */
  build?: (value: string) => string;
};

const handle = (base: string) => (v: string) => `${base}${v.replace(/^@/, "")}`;
const digits = (v: string) => v.replace(/[^\d+]/g, "");

export const PLATFORMS: Record<PlatformId, Platform> = {
  website: { id: "website", name: "Website", color: "#164E63", inputLabel: "URL", placeholder: "example.com" },
  instagram: { id: "instagram", name: "Instagram", color: "#E1306C", inputLabel: "Username or URL", placeholder: "@yourname", build: handle("https://instagram.com/") },
  linkedin: { id: "linkedin", name: "LinkedIn", color: "#0A66C2", inputLabel: "Profile URL", placeholder: "linkedin.com/in/yourname" },
  facebook: { id: "facebook", name: "Facebook", color: "#1877F2", inputLabel: "Username or URL", placeholder: "facebook.com/yourpage", build: handle("https://facebook.com/") },
  x: { id: "x", name: "X (Twitter)", color: "#111111", inputLabel: "Username or URL", placeholder: "@yourname", build: handle("https://x.com/") },
  tiktok: { id: "tiktok", name: "TikTok", color: "#111111", inputLabel: "Username or URL", placeholder: "@yourname", build: (v) => `https://tiktok.com/@${v.replace(/^@/, "")}` },
  youtube: { id: "youtube", name: "YouTube", color: "#FF0000", inputLabel: "Channel URL", placeholder: "youtube.com/@yourchannel" },
  whatsapp: { id: "whatsapp", name: "WhatsApp", color: "#25D366", inputLabel: "Phone number", placeholder: "250 788 000 000", build: (v) => `https://wa.me/${digits(v).replace(/^\+/, "")}` },
  email: { id: "email", name: "Email", color: "#0E7490", inputLabel: "Email address", placeholder: "you@example.com", build: (v) => `mailto:${v}` },
  phone: { id: "phone", name: "Call me", color: "#0F766E", inputLabel: "Phone number", placeholder: "+250 788 000 000", build: (v) => `tel:${digits(v)}` },
  location: { id: "location", name: "Location", color: "#EA580C", inputLabel: "Address or map link", placeholder: "KN 5 Rd, Kigali", build: (v) => `https://maps.google.com/?q=${encodeURIComponent(v)}` },
  github: { id: "github", name: "GitHub", color: "#24292F", inputLabel: "Username or URL", placeholder: "@yourname", build: handle("https://github.com/") },
};

export function getPlatform(id: string | null | undefined): Platform {
  return PLATFORMS[(id ?? "website") as PlatformId] ?? PLATFORMS.website;
}

/** Turns "@amani" or "0788…" into a full URL for the chosen platform. Leaves real URLs alone. */
export function toPlatformUrl(platformId: string | undefined, raw: string): string {
  const value = raw.trim();
  const platform = getPlatform(platformId);
  if (!value || !platform.build) return value;
  const looksLikeUrl = /^[a-z][a-z0-9+.-]*:/i.test(value) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(value);
  // An email address contains a dot too, so check it before the URL test.
  if (platform.id === "email") return value.startsWith("mailto:") ? value : `mailto:${value}`;
  return looksLikeUrl ? value : platform.build(value);
}

const ICONS: Record<PlatformId, React.ReactNode> = {
  website: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 2.5a14 14 0 0 0 0 19 14 14 0 0 0 0-19M2.5 12h19" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  x: (
    <>
      <path d="M4 4l11.7 16H20L8.3 4z" />
      <path d="M4 20l6.8-6.8M13.2 10.8L20 4" />
    </>
  ),
  tiktok: <path d="M21 7.9v4a10 10 0 0 1-5-1.9v4.5a6.5 6.5 0 1 1-8-6.3v4.3a2.5 2.5 0 1 0 4 2V3h4.1A6 6 0 0 0 21 7.9z" />,
  youtube: (
    <>
      <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="M10 15l5-3-5-3z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </>
  ),
  email: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  location: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  github: (
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.2-.3-2.4-1-3.5.3-1.2.3-2.4 0-3.5 0 0-1 0-3 1.5-2.6-.5-5.4-.5-8 0C6 2 5 2 5 2c-.3 1.1-.3 2.3 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.4.5-.7 1-.9 1.6-.2.6-.2 1.2-.1 1.9v4M9 18c-4.5 2-5-2-7-2" />
  ),
};

/** The platform's icon on a round brand-colored badge. */
export function PlatformIcon({ id, size = 32, className = "" }: { id: string; size?: number; className?: string }) {
  const platform = getPlatform(id);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white ${className}`}
      style={{ width: size, height: size, backgroundColor: platform.color }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[platform.id]}
      </svg>
    </span>
  );
}
