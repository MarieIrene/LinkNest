import { Avatar } from "./Avatar";
import { APP_NAME } from "@/lib/site";
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
                className="btn-press w-full break-words px-6 py-4 text-center text-base"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-9 text-center text-white/70">No links here yet.</p>
      )}

      <a href="/" className="mt-auto pt-12 text-sm text-white/60 hover:text-white">
        Make your own page with {APP_NAME}
      </a>
    </div>
  );
}
