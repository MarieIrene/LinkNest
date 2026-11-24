import Link from "next/link";
import { Icon, type IconName } from "@/components/shell/icons";

/** Title row at the top of every dashboard page. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-[65ch] text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** A white card with an optional heading row. */
export function Card({
  title, description, action, children, className = "", id,
}: {
  title?: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(11,47,59,0.04)] sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {title && <h2 id={headingId} className="font-display text-lg font-bold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink/60">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const tones = {
  teal: "bg-secondary-soft text-primary",
  blue: "bg-sky-100 text-sky-800",
  violet: "bg-violet-100 text-violet-800",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-emerald-100 text-emerald-800",
} as const;

/** A key number with an icon chip. Becomes a link when `href` is given. */
export function StatCard({
  label, value, sub, icon, tone = "teal", href, highlight = false,
}: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; icon: IconName; tone?: keyof typeof tones; href?: string; highlight?: boolean;
}) {
  const body = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink/60">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">{value}</p>
        {sub && <p className="mt-0.5 text-sm text-ink/55">{sub}</p>}
      </div>
    </div>
  );
  const cls = `block h-full rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(11,47,59,0.04)] ${
    highlight ? "border-amber-300 ring-4 ring-amber-50" : "border-line"
  }`;
  return href ? (
    <Link href={href} className={`${cls} transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
