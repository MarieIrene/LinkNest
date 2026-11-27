import { CARD_STATUSES, type CardStatus } from "@/lib/cards";

export function CardStatusBadge({ status, assigned }: { status: string; assigned: boolean }) {
  if (status === "active" && !assigned) {
    return <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Not given yet</span>;
  }
  const s = CARD_STATUSES[status as CardStatus] ?? CARD_STATUSES.active;
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.tone}`}>{s.label}</span>;
}

/** QR code for a card link with download buttons (SVG for print shops, PNG for everything else). */
export function CardQr({ id, size = 160 }: { id: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/c/${id}/qr`} alt="QR code that opens this card's profile" width={size} height={size}
        className="rounded-xl border border-line bg-white p-1" />
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        <a href={`/c/${id}/qr?download=1`} className="btn-ghost border border-line px-3 py-1.5 text-sm">Download SVG (print)</a>
        <a href={`/c/${id}/qr?format=png&download=1`} className="btn-ghost border border-line px-3 py-1.5 text-sm">Download PNG</a>
      </div>
    </div>
  );
}
