import Link from "next/link";
import { Avatar } from "./Avatar";
import { APP_NAME } from "@/lib/site";
import { PlatformIcon } from "@/lib/platforms";
import type { PublicLink } from "@/lib/types";

type Props = {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  links: PublicLink[];
  /** "live" routes clicks through /go/:id for counting; "preview" opens the real URL. */
  mode?: "live" | "preview";
};

/** The public page people see. Shared by /[username] and the dashboard preview. */
export function LinkPage({ username, displayName, bio, avatarUrl, links, mode = "live" }: Props) {
  const name = displayName?.trim() || username;

  return (
    <div className="on-dark flex min-h-full flex-col items-center bg-primary px-5 pb-8 pt-12 text-white">
      <Avatar name={name} src={avatarUrl} />
      <h1 className="mt-5 text-center font-display text-3xl font-bold leading-tight tracking-tight">{name}</h1>
      <p className="mt-1 text-sm text-secondary">@{username}</p>
      {bio && <p className="mt-4 max-w-sm text-center leading-relaxed text-white/80">{bio}</p>}

      {links.length > 0 ? (
        <ul className="mt-9 flex w-full max-w-md flex-col gap-4">
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
        <p className="mt-9 text-center text-white/70">No links here yet.</p>
      )}

      <Link href="/" className="mt-auto pt-12 text-sm text-white/60 hover:text-white">
        Make your own page with {APP_NAME}
      </Link>
    </div>
  );
}
