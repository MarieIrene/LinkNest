import Link from "next/link";
import { Avatar } from "./Avatar";
import { APP_NAME } from "@/lib/site";
import { PlatformIcon } from "@/lib/platforms";
import { roleLine, telHref, whatsappHref, type ContactInfo } from "@/lib/contact";
import type { PublicLink } from "@/lib/types";

type Props = {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  links: PublicLink[];
  contact?: ContactInfo;
  /** "live" routes clicks through /go/:id for counting; "preview" opens the real URL. */
  mode?: "live" | "preview";
};

function QuickAction({ href, label, platform, external = false }: { href: string; label: string; platform: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      className="flex flex-col items-center gap-1.5 text-xs font-semibold text-white/85 hover:text-white">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20">
        <PlatformIcon id={platform} size={36} />
      </span>
      {label}
    </a>
  );
}

/** The public page people see after tapping a card. Shared by /[username] and the dashboard preview. */
export function LinkPage({ username, displayName, bio, avatarUrl, links, contact = {}, mode = "live" }: Props) {
  const name = displayName?.trim() || username;
  const role = roleLine(contact);
  const hasQuickActions = Boolean(contact.phone || contact.whatsapp || contact.publicEmail);

  return (
    <div className="on-dark flex min-h-full flex-col items-center bg-primary px-5 pb-8 pt-12 text-white">
      <Avatar name={name} src={avatarUrl} />
      <h1 className="mt-5 text-center font-display text-3xl font-bold leading-tight tracking-tight">{name}</h1>
      {role ? (
        <p className="mt-1 text-center font-medium text-secondary">{role}</p>
      ) : (
        <p className="mt-1 text-sm text-secondary">@{username}</p>
      )}
      {contact.location && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-white/70">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {contact.location}
        </p>
      )}
      {bio && <p className="mt-4 max-w-sm text-center leading-relaxed text-white/80">{bio}</p>}

      {hasQuickActions && (
        <nav aria-label="Contact" className="mt-6 flex justify-center gap-6">
          {contact.phone && <QuickAction href={telHref(contact.phone)} label="Call" platform="phone" />}
          {contact.whatsapp && <QuickAction href={whatsappHref(contact.whatsapp)} label="WhatsApp" platform="whatsapp" external />}
          {contact.publicEmail && <QuickAction href={`mailto:${contact.publicEmail}`} label="Email" platform="email" />}
        </nav>
      )}

      <a
        href={`/${username}/contact.vcf`}
        className="mt-6 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-secondary px-6 py-3 font-semibold text-secondary transition hover:bg-secondary hover:text-primary-dark"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="10" cy="8" r="4" /><path d="M2.5 20a7.5 7.5 0 0 1 12-6M19 14v6M16 17h6" />
        </svg>
        Save contact
      </a>

      {links.length > 0 ? (
        <ul className="mt-6 flex w-full max-w-md flex-col gap-4">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={mode === "live" ? `/go/${link.id}` : link.url}
                target={mode === "preview" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="btn-press w-full gap-3 break-words py-3 pl-3 pr-6 text-left text-base"
              >
                <PlatformIcon id={link.platform} size={36} />
                <span className="min-w-0 flex-1 text-center">{link.title}</span>
                <span aria-hidden="true" className="w-6 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        !hasQuickActions && <p className="mt-9 text-center text-white/70">No links here yet.</p>
      )}

      <Link href="/" className="mt-auto pt-12 text-sm text-white/60 hover:text-white">
        Make your own page with {APP_NAME}
      </Link>
    </div>
  );
}
