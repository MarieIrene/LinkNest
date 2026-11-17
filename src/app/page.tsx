import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LinkPage } from "@/components/LinkPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import { getCurrentUserId } from "@/lib/auth";
import { APP_HOST } from "@/lib/site";

const sample = {
  username: "amani",
  displayName: "Amani Uwase",
  bio: "Photographer in Kigali. Weddings, portraits and city stories.",
  links: [
    { id: "1", title: "See my portfolio", url: "#" },
    { id: "2", title: "Instagram", url: "#" },
    { id: "3", title: "Book a photo shoot", url: "#" },
    { id: "4", title: "Email me", url: "#" },
  ],
};

const steps = [
  { title: "Claim your link", text: `Pick a username. Your page lives at ${APP_HOST}/yourname.` },
  { title: "Add what matters", text: "Portfolio, socials, shop, a form, a CV. Reorder or hide links any time." },
  { title: "Share one URL", text: "Put it in your bio, email signature or a QR code. See which links get clicked." },
];

export default async function HomePage() {
  const signedIn = Boolean(await getCurrentUserId());

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          {signedIn ? (
            <Link href="/dashboard" className="btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-10 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
          <div>
            <h1 className="max-w-[12ch] font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-primary sm:text-7xl">
              One link for everything you share.
            </h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink/75">
              Put your portfolio, socials, shop and documents on a single page. Share one URL instead of five.
            </p>

            <form action="/register" method="get" className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
              <label htmlFor="claim" className="sr-only">Choose your username</label>
              <div className="flex flex-1 items-center rounded-full border border-line bg-white pl-5 focus-within:border-primary focus-within:ring-2 focus-within:ring-secondary">
                <span className="shrink-0 text-ink/50">{APP_HOST}/</span>
                <input
                  id="claim"
                  name="username"
                  placeholder="yourname"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full min-w-0 rounded-full bg-transparent py-3 pr-4 text-ink placeholder:text-ink/35 focus:outline-none"
                />
              </div>
              <button type="submit" className="btn-press">Claim your link</button>
            </form>
          </div>

          <div inert>
            <PhoneFrame label={`Example page for ${sample.displayName}`}>
              <LinkPage {...sample} mode="preview" />
            </PhoneFrame>
          </div>
        </section>

        <section className="border-t border-line bg-white">
          <ol className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-display font-bold text-primary-dark">
                  {i + 1}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-primary">{step.title}</h2>
                <p className="mt-2 max-w-[36ch] leading-relaxed text-ink/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink/55">
        © {new Date().getFullYear()} LinkNest
      </footer>
    </div>
  );
}
