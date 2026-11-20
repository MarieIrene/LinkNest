import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LinkPage } from "@/components/LinkPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BookButton } from "@/components/landing/BookButton";
import { BookingForm } from "@/components/landing/BookingForm";
import { Reveal } from "@/components/landing/Reveal";
import { TapDemo } from "@/components/landing/TapDemo";
import { NfcIcon, SmartCard, SocialTag } from "@/components/landing/Visuals";
import { formatRwf, sampleProfile } from "@/components/landing/sample";
import { getCurrentUserId } from "@/lib/auth";
import { PlatformIcon } from "@/lib/platforms";
import { PRODUCTS } from "@/lib/products";
import { APP_NAME, COMPANY } from "@/lib/site";

const nav = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#profile", label: "Digital profile" },
  { href: "#pricing", label: "Pricing" },
  { href: "#book", label: "Book" },
];

const steps = [
  { title: "Choose your card or tag", text: "Pick a Business Smart Card or a Social Media Tag. We set up your digital profile with you." },
  { title: "Tap it against a smartphone", text: "Hold the card near any NFC-enabled phone. No app to install, nothing to scan." },
  { title: "Your profile opens instantly", text: "A notification pops up and your business profile opens: contacts, socials, website and more." },
];

const profileFeatures = [
  { icon: "phone", title: "Call and WhatsApp", text: "One tap to call you or start a chat." },
  { icon: "linkedin", title: "All your social media", text: "Instagram, LinkedIn, TikTok, Facebook, X and YouTube, each with its own icon." },
  { icon: "website", title: "Website, email and location", text: "Send people to your site, inbox or office on the map." },
  { icon: "instagram", title: "Your photo and story", text: "Upload your photo and a short bio so people remember you." },
];

const products = [
  {
    id: "business-card" as const,
    visual: <SmartCard className="w-[260px] text-[18px] transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105" />,
    blurb: "A premium wallet-size card that holds your full business profile.",
    features: ["Opens your full business profile", "Works with NFC-enabled iPhone and Android phones", "No app needed for the person tapping", "Update your details any time, no reprinting"],
  },
  {
    id: "social-tag" as const,
    visual: <SocialTag className="w-[170px] transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105" />,
    blurb: "A compact NFC tag that sends people straight to your social pages.",
    features: ["Grow your followers with one tap", "Great for shops, counters and events", "Shows all your social links with icons", "Change your links any time"],
  },
];

const benefits = [
  {
    title: "Share information instantly",
    text: "One tap and your details are on their phone. No typing, no spelling mistakes.",
    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    title: "No more stacks of paper cards",
    text: "One smart card replaces boxes of printed cards that run out or go out of date.",
    icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  },
  {
    title: "Easy, professional networking",
    text: "Make a strong first impression at meetings, events and in your shop.",
    icon: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2a5 5 0 0 1 5.5 4.8" /></>,
  },
  {
    title: "One tap to your digital identity",
    text: "Your contacts, socials and website, always up to date in one place.",
    icon: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  },
];

const bookingSteps = [
  "Select your product",
  "Enter your name and contact details",
  "Submit your booking request",
  "We call you to set up your account and prepare your card",
];

export default async function HomePage() {
  const signedIn = Boolean(await getCurrentUserId());

  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-5">
          <Logo />
          <nav aria-label="Sections" className="ml-8 hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="btn-ghost px-3 text-sm">{n.label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {signedIn ? (
              <>
                <Link href="/dashboard" className="btn-ghost px-3 sm:px-4">Dashboard</Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="btn-ghost px-3 sm:px-4">Log out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost px-3 sm:px-4">Log in</Link>
                <Link href="/register" className="btn-ghost border border-primary/30 px-3 sm:px-4">Sign up</Link>
              </>
            )}
            <BookButton className="btn-primary hidden sm:inline-flex">Book now</BookButton>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="animate-blob absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-secondary/30 blur-3xl" />
            <div className="animate-blob absolute -left-40 top-64 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl [animation-delay:-7s]" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-5 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary-soft px-3 py-1 text-sm font-semibold text-primary">
                <NfcIcon size={16} /> Smart NFC business cards
              </p>
              <h1 className="mt-5 max-w-[14ch] font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-primary sm:text-6xl lg:text-7xl">
                Your business profile, one tap away.
              </h1>
              <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ink/75">
                Store your whole business profile on one smart card. Tap it on any NFC-enabled smartphone and your
                contacts, social media and website open instantly. No app, no paper.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <BookButton className="btn-press px-8 py-4 text-lg">Book your card</BookButton>
                <a href="#how-it-works" className="btn-ghost border border-line bg-white px-6 py-3.5">
                  See how it works
                </a>
              </div>
              <p className="mt-4 text-sm text-ink/65">
                {signedIn ? (
                  <>Welcome back. <Link href="/dashboard" className="font-semibold text-primary underline-offset-4 hover:underline">Open your dashboard</Link> to edit your profile.</>
                ) : (
                  <>
                    Already have a card?{" "}
                    <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Log in</Link>
                    {" "}to edit your profile. New here?{" "}
                    <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">Create your profile</Link>.
                  </>
                )}
              </p>

              <dl className="mt-10 grid max-w-md grid-cols-2 gap-3">
                {Object.values(PRODUCTS).map((p) => (
                  <div key={p.name} className="rounded-2xl border border-line bg-white/80 px-4 py-3">
                    <dt className="text-sm text-ink/60">{p.name}</dt>
                    <dd className="font-display text-xl font-bold text-primary">{formatRwf(p.price)}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={150}>
              <TapDemo />
            </Reveal>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-5">
            <SectionHeading eyebrow="How it works" title="Three steps. One tap." />

            <div aria-hidden="true" className="mx-auto mt-10 hidden h-1 max-w-3xl overflow-hidden rounded-full bg-line md:block">
              <div className="step-progress h-full bg-secondary" />
            </div>

            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 120} className="h-full">
                    <div className="step-cycle h-full rounded-3xl bg-paper p-6" style={{ animationDelay: `${i * 2.5}s` }}>
                      <div className="flex h-40 items-center justify-center rounded-2xl bg-white">
                        <StepVisual index={i} />
                      </div>
                      <span className="mt-6 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display font-bold text-secondary">
                        {i + 1}
                      </span>
                      <h3 className="mt-3 font-display text-2xl font-bold text-primary">{step.title}</h3>
                      <p className="mt-2 leading-relaxed text-ink/70">{step.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Digital profile ---------- */}
        <section id="profile" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-5 lg:grid-cols-[1fr_1.1fr]">
            <Reveal className="relative order-2 lg:order-1">
              <div inert className="relative mx-auto w-fit">
                <PhoneFrame label={`Example business profile for ${sampleProfile.displayName}`}>
                  <LinkPage {...sampleProfile} mode="preview" />
                </PhoneFrame>
                {[
                  { id: "whatsapp", label: "WhatsApp", pos: "-left-6 top-24 sm:-left-16", delay: "0s" },
                  { id: "linkedin", label: "LinkedIn", pos: "-right-4 top-44 sm:-right-16", delay: "-2s" },
                  { id: "instagram", label: "Instagram", pos: "-left-4 bottom-32 sm:-left-14", delay: "-4s" },
                ].map((chip) => (
                  <span
                    key={chip.id}
                    aria-hidden="true"
                    className={`animate-float absolute ${chip.pos} hidden items-center sm:flex gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink shadow-lg ring-1 ring-line`}
                    style={{ animationDelay: chip.delay }}
                  >
                    <PlatformIcon id={chip.id} size={28} /> {chip.label}
                  </span>
                ))}
              </div>
            </Reveal>

            <div className="order-1 lg:order-2">
              <Reveal>
                <SectionHeading align="left" eyebrow="Your digital profile" title="One card holds your whole business." />
                <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink/70">
                  Your card opens a mobile page you control from your {APP_NAME} dashboard. Change a number or add a new
                  social account and every card you&apos;ve handed out shows it straight away.
                </p>
              </Reveal>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {profileFeatures.map((f, i) => (
                  <li key={f.title}>
                    <Reveal delay={i * 100} className="h-full">
                      <div className="flex h-full gap-3 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg">
                        <PlatformIcon id={f.icon} size={40} />
                        <div>
                          <h3 className="font-semibold text-ink">{f.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-ink/65">{f.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Products & pricing ---------- */}
        <section id="pricing" className="scroll-mt-20 border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-5">
            <SectionHeading eyebrow="Our products" title="Pick your smart card." />
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              {products.map((p, i) => {
                const info = PRODUCTS[p.id];
                return (
                  <Reveal key={p.id} delay={i * 150} className="h-full">
                    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(11,47,59,0.45)]">
                      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-soft to-secondary-soft">
                        <div aria-hidden="true" className="absolute h-56 w-56 rounded-full bg-white/50 blur-2xl" />
                        <div className="animate-float relative" style={{ animationDelay: `${-i * 3}s` }}>{p.visual}</div>
                      </div>
                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        <h3 className="font-display text-2xl font-bold text-primary">{info.name}</h3>
                        <p className="mt-1 text-ink/70">{p.blurb}</p>
                        <p className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink">
                          {info.price.toLocaleString("en-US")} <span className="text-xl font-bold text-ink/60">RWF</span>
                        </p>
                        <ul className="mt-5 space-y-2.5">
                          {p.features.map((f) => (
                            <li key={f} className="flex gap-2.5 text-ink/80">
                              <Check /> {f}
                            </li>
                          ))}
                        </ul>
                        <BookButton product={p.id} className="btn-press mt-8 w-full py-3.5 text-lg">
                          Book now
                        </BookButton>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Benefits ---------- */}
        <section className="on-dark relative overflow-hidden bg-primary text-white">
          <div aria-hidden="true" className="animate-blob pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-5">
            <SectionHeading dark eyebrow="Why choose our smart cards?" title="Network smarter, not harder." />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b, i) => (
                <li key={b.title}>
                  <Reveal delay={i * 120} className="h-full">
                    <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary-dark">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{b.icon}</svg>
                      </span>
                      <h3 className="mt-5 font-display text-xl font-bold">{b.title}</h3>
                      <p className="mt-2 leading-relaxed text-white/75">{b.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Book ---------- */}
        <section id="book" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <SectionHeading align="left" eyebrow="Book your card" title="Book your card today." />
              <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink/70">
                Send a booking request in under a minute. Our team follows up to configure your account and prepare your card.
              </p>
              <ol className="mt-8 space-y-4">
                {bookingSteps.map((s, i) => (
                  <li key={s} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display font-bold text-primary-dark">
                      {i + 1}
                    </span>
                    <span className="text-ink/80">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-ink/70">
                Prefer to talk?{" "}
                {COMPANY.phones.map((phone, i) => (
                  <span key={phone}>
                    {i > 0 && " / "}
                    <a href={`tel:${phone}`} className="font-semibold text-primary underline-offset-2 hover:underline">{phone}</a>
                  </span>
                ))}
              </p>
            </Reveal>
            <Reveal delay={150}>
              <BookingForm />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeading({ eyebrow, title, align = "center", dark = false }: {
  eyebrow: string; title: string; align?: "left" | "center"; dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className={`text-sm font-bold uppercase tracking-[0.18em] ${dark ? "text-secondary" : "text-primary/70"}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${dark ? "text-white" : "text-primary"}`}>
        {title}
      </h2>
    </div>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-[#0d9488]">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Small looping illustrations for the three steps. */
function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div aria-hidden="true" className="flex items-end gap-5">
        <div className="mini-pick rounded-xl"><SmartCard className="w-[120px] text-[9px]" /></div>
        <div className="mini-pick rounded-[28%] [animation-delay:-1.5s]"><SocialTag className="w-[72px] [&_svg]:hidden [&_span]:hidden" /></div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div aria-hidden="true" className="relative flex items-center">
        <div className="mini-tap relative z-10"><SmartCard className="w-[96px] text-[8px]" /></div>
        <div className="relative -ml-2 h-28 w-16 rounded-xl border-4 border-ink bg-primary">
          <span className="mini-wave absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full border-2 border-secondary" />
          <span className="mini-wave absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full border-2 border-secondary [animation-delay:0.3s]" />
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="flex h-32 w-[72px] flex-col items-center gap-1.5 rounded-xl border-4 border-ink bg-primary px-2 pt-3">
      <span className="h-6 w-6 rounded-full border-2 border-secondary bg-primary-dark" />
      <span className="mini-line h-1.5 w-10 rounded-full bg-white/80" />
      {[0, 1, 2].map((i) => (
        <span key={i} className="mini-line h-3 w-full rounded-full bg-secondary" style={{ animationDelay: `${0.15 * (i + 1)}s` }} />
      ))}
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-5 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-[36ch] leading-relaxed text-white/70">
            Smart NFC business cards and social media tags. Share your whole business profile with one tap.
          </p>
          <BookButton className="btn-press mt-6">Book your card</BookButton>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-lg font-bold">Explore</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            {nav.map((n) => (
              <li key={n.href}><a href={n.href} className="hover:text-secondary">{n.label}</a></li>
            ))}
            <li><Link href="/login" className="hover:text-secondary">Log in to your profile</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg font-bold">Contact</h2>
          <ul className="mt-4 space-y-3 text-white/75">
            <li className="flex items-center gap-3">
              <PlatformIcon id="website" size={30} className="!bg-white/10" />
              <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
                {COMPANY.website.replace(/^https?:\/\//, "")}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <PlatformIcon id="phone" size={30} className="!bg-white/10" />
              <span>
                {COMPANY.phones.map((phone, i) => (
                  <span key={phone}>
                    {i > 0 && " / "}
                    <a href={`tel:${phone}`} className="hover:text-secondary">{phone}</a>
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p>© {year} {APP_NAME}. All rights reserved.</p>
          <p>
            Powered by{" "}
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary hover:underline">
              {COMPANY.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
