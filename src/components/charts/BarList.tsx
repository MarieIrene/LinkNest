import { PlatformIcon } from "@/lib/platforms";

export type BarListItem = { id: string; label: string; value: number; platform?: string };

/**
 * Ranked horizontal bars (e.g. clicks per link). One hue for magnitude; the label and
 * value sit beside the bar in ink colours, so it reads without colour or hovering.
 */
export function BarList({ items, unit, empty }: { items: BarListItem[]; unit: [string, string]; empty: string }) {
  if (items.length === 0) return <p className="py-6 text-center text-ink/55">{empty}</p>;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...sorted.map((i) => i.value));

  return (
    <ul className="space-y-3">
      {sorted.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          {item.platform && <PlatformIcon id={item.platform} size={28} />}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-ink">{item.label}</span>
              <span className="shrink-0 tabular-nums text-ink/70">
                {item.value.toLocaleString("en-US")} <span className="sr-only">{item.value === 1 ? unit[0] : unit[1]}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-primary-soft" aria-hidden="true">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? 6 : 0 }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
