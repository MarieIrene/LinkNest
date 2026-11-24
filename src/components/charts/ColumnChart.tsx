"use client";

import { useId, useState } from "react";

export type ColumnDatum = { key: string; label: string; shortLabel: string; value: number };

/**
 * One-series column chart (e.g. bookings per day). Thin columns with a 2px gap and
 * rounded tops on a recessive grid; hovering or focusing a day shows its value, and
 * a table view is one click away. The chart's title names the series, so no legend.
 */
export function ColumnChart({
  data, unit, height = 180, tickEvery = 7,
}: { data: ColumnDatum[]; unit: [singular: string, plural: string]; height?: number; tickEvery?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();
  const max = Math.max(1, ...data.map((d) => d.value));
  // Round the top of the scale to a friendly number so gridlines read cleanly.
  const step = max <= 4 ? 1 : max <= 10 ? 2 : Math.ceil(max / 4 / 5) * 5;
  const top = Math.ceil(max / step) * step;
  const gridlines = Array.from({ length: top / step + 1 }, (_, i) => i * step).reverse();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const fmt = (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? unit[0] : unit[1]}`;
  const shown = active !== null ? data[active] : null;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="font-display text-2xl font-bold text-ink">{total.toLocaleString("en-US")}
          <span className="ml-1.5 text-sm font-normal text-ink/55">in {data.length} days</span>
        </p>
        <p aria-live="polite" className="min-h-[1.25rem] text-right text-sm text-ink/70">
          {shown ? <><span className="font-semibold text-ink">{fmt(shown.value)}</span> · {shown.label}</> : <span className="text-ink/45">Hover a day for details</span>}
        </p>
      </div>

      <div className="flex gap-2">
        {/* Y axis labels */}
        <div className="relative w-6 shrink-0 text-right text-[11px] text-ink/45" style={{ height }} aria-hidden="true">
          {gridlines.map((g) => (
            <span key={g} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - g / top) * 100}%` }}>{g}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Gridlines */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {gridlines.map((g) => (
              <div key={g} className={`absolute inset-x-0 border-t ${g === 0 ? "border-ink/25" : "border-dashed border-line"}`}
                style={{ top: `${(1 - g / top) * 100}%` }} />
            ))}
          </div>

          {/* Columns: each full-height slot is the hover/focus target, bigger than the mark. */}
          <div className="relative flex items-end gap-[2px]" style={{ height }} role="list" aria-label="Values by day">
            {data.map((d, i) => (
              <div
                key={d.key}
                role="listitem"
                tabIndex={0}
                aria-label={`${d.label}: ${fmt(d.value)}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group flex h-full min-w-0 flex-1 cursor-default items-end rounded-sm outline-none focus-visible:bg-primary-soft"
              >
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${active === i ? "bg-primary-dark" : "bg-primary"} ${d.value === 0 ? "opacity-0" : ""}`}
                  style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }}
                />
              </div>
            ))}
          </div>

          {/* X axis: a label every `tickEvery` days so they never collide */}
          <div className="relative mt-1.5 h-4 text-[11px] text-ink/45" aria-hidden="true">
            {data.map((d, i) =>
              (i % tickEvery === 0 && i < data.length - 1 - Math.ceil(tickEvery / 2)) || i === data.length - 1 ? (
                <span key={d.key} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${((i + 0.5) / data.length) * 100}%` }}>
                  {d.shortLabel}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-primary">Show as table</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-line">
          <table id={tableId} className="w-full text-left">
            <thead className="sticky top-0 bg-paper text-ink/70">
              <tr><th scope="col" className="px-3 py-2 font-semibold">Day</th><th scope="col" className="px-3 py-2 text-right font-semibold">Count</th></tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.key} className="border-t border-line">
                  <td className="px-3 py-1.5">{d.label}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
